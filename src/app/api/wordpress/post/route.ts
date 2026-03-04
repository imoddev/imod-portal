import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createWordPressDraft, searchCategories, searchTags, createTag } from "@/lib/wordpress-post";
import { notifyNewDraft } from "@/lib/discord-notify";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      site,
      title,
      content,
      excerpt,
      slug,
      focusKeyphrase,
      metaDescription,
      categories,
      tags,
      sourceUrl,
      notify = true,
    } = body;

    if (!site || !title || !content) {
      return NextResponse.json(
        { error: "Site, title, and content are required" },
        { status: 400 }
      );
    }

    // Resolve category IDs
    let categoryIds: number[] = [];
    if (categories?.length) {
      for (const catName of categories) {
        const found = await searchCategories(site, catName);
        if (found.length > 0) {
          categoryIds.push(found[0].id);
        }
      }
    }

    // Resolve tag IDs (create if not exists)
    let tagIds: number[] = [];
    if (tags?.length) {
      for (const tagName of tags) {
        const found = await searchTags(site, tagName);
        if (found.length > 0) {
          tagIds.push(found[0].id);
        } else {
          // Create new tag
          const newTagId = await createTag(site, tagName);
          if (newTagId) {
            tagIds.push(newTagId);
          }
        }
      }
    }

    // Create draft on WordPress
    const result = await createWordPressDraft(
      site,
      {
        title,
        content,
        excerpt,
        slug,
        status: "draft",
        categories: categoryIds.length > 0 ? categoryIds : undefined,
        tags: tagIds.length > 0 ? tagIds : undefined,
        meta: {
          _yoast_wpseo_focuskw: focusKeyphrase,
          _yoast_wpseo_metadesc: metaDescription,
        },
      },
      session.user.id // Discord ID for author mapping
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create draft" },
        { status: 500 }
      );
    }

    // Send Discord notification
    if (notify) {
      await notifyNewDraft({
        title,
        site,
        author: session.user.name || "Unknown",
        editUrl: result.editUrl,
        sourceUrl,
      });
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      editUrl: result.editUrl,
    });
  } catch (error) {
    console.error("Error creating WordPress draft:", error);
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status: 500 }
    );
  }
}

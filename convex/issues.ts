import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { calculateDistanceKm, isWithinRadius } from "./locations";

export const list = query({
  args: {
    category: v.optional(v.string()),
    scope: v.optional(v.string()),
    localArea: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    userLat: v.optional(v.number()),
    userLng: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("popular"), v.literal("newest"), v.literal("nearest"))),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let issues = await ctx.db.query("issues").collect();

    // 1. Filter by Status (Solved/Resolved issues are shown exclusively on the Solved Issues page)
    if (args.status && args.status.toLowerCase() !== "all") {
      issues = issues.filter((i) => i.status.toLowerCase() === args.status!.toLowerCase());
    } else if (!args.status) {
      issues = issues.filter((i) => i.status.toLowerCase() !== "resolved");
    }

    // 2. Filter by Category
    if (args.category && args.category.toLowerCase() !== "all") {
      const catTarget = args.category.toLowerCase().replace(/[^a-z]/g, "");
      issues = issues.filter((i) => {
        const itemCat = i.category.toLowerCase().replace(/[^a-z]/g, "");
        return itemCat.includes(catTarget) || catTarget.includes(itemCat);
      });
    }

    // 3. Location Scope Filtering
    if (args.scope) {
      const scope = args.scope.toLowerCase();
      if (scope === "local area" || scope === "nearby") {
        if (args.userLat !== undefined && args.userLng !== undefined) {
          issues = issues.filter((i) =>
            isWithinRadius(args.userLat!, args.userLng!, i.latitude, i.longitude, 5.0)
          );
        } else if (args.localArea) {
          issues = issues.filter(
            (i) => i.localArea.toLowerCase().includes(args.localArea!.toLowerCase())
          );
        }
      } else if (scope === "district" && args.district) {
        issues = issues.filter((i) =>
          i.district.toLowerCase().includes(args.district!.toLowerCase())
        );
      } else if (scope === "state" && args.state) {
        issues = issues.filter((i) =>
          i.state.toLowerCase().includes(args.state!.toLowerCase())
        );
      }
    }

    // 4. Attach distance & media preview
    const enriched = await Promise.all(
      issues.map(async (issue) => {
        let distanceKm: number | null = null;
        if (args.userLat !== undefined && args.userLng !== undefined) {
          distanceKm = calculateDistanceKm(
            args.userLat,
            args.userLng,
            issue.latitude,
            issue.longitude
          );
        }

        // Get all attached evidence items
        const evidenceList = await ctx.db
          .query("evidence")
          .withIndex("by_issueId", (q) => q.eq("issueId", issue._id))
          .collect();

        const evidenceWithUrls = await Promise.all(
          evidenceList.map(async (ev) => ({
            ...ev,
            url: await ctx.storage.getUrl(ev.storageId),
          }))
        );

        const primaryMedia = evidenceWithUrls.find((e) => e.approvalStatus === "approved") || evidenceWithUrls[0];
        let mediaUrl: string | null = primaryMedia?.url || null;
        let mediaType: string | null = primaryMedia?.mediaType || null;

        if (!mediaUrl && issue.resolutionEvidenceUrl) {
          mediaUrl = issue.resolutionEvidenceUrl;
          mediaType = "image";
        } else if (!mediaUrl && issue.resolutionEvidenceStorageId) {
          mediaUrl = await ctx.storage.getUrl(issue.resolutionEvidenceStorageId);
          mediaType = "image";
        }

        return {
          ...issue,
          distanceKm,
          mediaUrl,
          url: mediaUrl,
          mediaType,
          type: mediaType === "video" ? "video" : "photo",
          evidence: evidenceWithUrls,
        };
      })
    );

    // 5. Sort
    const sortBy = args.sortBy || "popular";
    if (sortBy === "popular") {
      enriched.sort((a, b) => b.voteCount - a.voteCount);
    } else if (sortBy === "newest") {
      enriched.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "nearest") {
      enriched.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    const limit = args.limit || 100;
    return enriched.slice(0, limit);
  },
});

export const getById = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.id);
    if (!issue) return null;

    // Fetch all attached approved evidence
    const evidenceList = await ctx.db
      .query("evidence")
      .withIndex("by_issueId", (q) => q.eq("issueId", issue._id))
      .collect();

    const mediaWithUrls = await Promise.all(
      evidenceList.map(async (ev) => ({
        ...ev,
        url: await ctx.storage.getUrl(ev.storageId),
      }))
    );

    let resolutionEvidenceUrl = issue.resolutionEvidenceUrl || null;
    if (issue.resolutionEvidenceStorageId && !resolutionEvidenceUrl) {
      resolutionEvidenceUrl = await ctx.storage.getUrl(issue.resolutionEvidenceStorageId);
    }

    return {
      ...issue,
      evidence: mediaWithUrls,
      resolutionEvidenceUrl,
    };
  },
});

export const getByIdOrTitle = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const raw = args.identifier.trim();
    if (!raw) return null;

    const all = await ctx.db.query("issues").collect();
    const matched = all.find(
      (i) =>
        i._id === raw ||
        i.title.toLowerCase() === raw.toLowerCase() ||
        i.title.toLowerCase().includes(raw.toLowerCase()) ||
        raw.toLowerCase().includes(i.title.toLowerCase())
    );

    if (matched) {
      const evidenceList = await ctx.db
        .query("evidence")
        .withIndex("by_issueId", (q) => q.eq("issueId", matched._id))
        .collect();

      const mediaWithUrls = await Promise.all(
        evidenceList.map(async (ev) => ({
          ...ev,
          url: await ctx.storage.getUrl(ev.storageId),
        }))
      );

      let resolutionEvidenceUrl = matched.resolutionEvidenceUrl || null;
      if (matched.resolutionEvidenceStorageId && !resolutionEvidenceUrl) {
        resolutionEvidenceUrl = await ctx.storage.getUrl(matched.resolutionEvidenceStorageId);
      }

      return {
        ...matched,
        evidence: mediaWithUrls,
        resolutionEvidenceUrl,
      };
    }

    return null;
  },
});

/**
 * 1 KM Nearby Search (Location-Based Issue Discovery).
 */
export const findNearby = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radiusKm || 1.0;
    const allIssues = await ctx.db.query("issues").collect();

    const nearby = allIssues
      .map((issue) => ({
        ...issue,
        distanceKm: calculateDistanceKm(args.latitude, args.longitude, issue.latitude, issue.longitude),
      }))
      .filter((issue) => issue.distanceKm <= radius);

    nearby.sort((a, b) => a.distanceKm - b.distanceKm);

    return await Promise.all(
      nearby.map(async (issue) => {
        const firstMedia = await ctx.db
          .query("evidence")
          .withIndex("by_issueId", (q) => q.eq("issueId", issue._id))
          .first();

        let mediaUrl = null;
        if (firstMedia) {
          mediaUrl = await ctx.storage.getUrl(firstMedia.storageId);
        }

        return {
          ...issue,
          mediaUrl,
        };
      })
    );
  },
});

/**
 * Duplicate Report Prevention check before submitting a new issue.
 * Finds existing issues within 1 km of selected coordinates.
 */
export const checkDuplicates = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allIssues = await ctx.db.query("issues").collect();

    const duplicates = allIssues
      .map((issue) => ({
        ...issue,
        distanceKm: calculateDistanceKm(args.latitude, args.longitude, issue.latitude, issue.longitude),
      }))
      .filter((issue) => issue.distanceKm <= 1.0); // 1 km radius rule

    duplicates.sort((a, b) => a.distanceKm - b.distanceKm);

    return await Promise.all(
      duplicates.map(async (issue) => {
        const media = await ctx.db
          .query("evidence")
          .withIndex("by_issueId", (q) => q.eq("issueId", issue._id))
          .first();
        const mediaUrl = media ? await ctx.storage.getUrl(media.storageId) : null;
        return {
          ...issue,
          mediaUrl,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Pothole"),
      v.literal("Road Damage"),
      v.literal("Garbage"),
      v.literal("Broken Streetlight"),
      v.literal("Water / Drainage"),
      v.literal("Public Infrastructure"),
      v.literal("Other")
    ),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    localArea: v.string(),
    district: v.string(),
    state: v.string(),
    pinCode: v.string(),
    userId: v.id("users"),
    evidenceStorageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Authenticated user required to report an issue.");

    const now = Date.now();
    const issueId = await ctx.db.insert("issues", {
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      latitude: args.latitude,
      longitude: args.longitude,
      address: args.address.trim(),
      localArea: args.localArea.trim() || args.district.trim(),
      district: args.district.trim(),
      state: args.state.trim(),
      pinCode: args.pinCode.trim(),
      createdBy: user._id,
      createdByName: user.name,
      voteCount: 1, // Author gets initial support vote
      status: "Reported", // Requires admin review & approval before appearing publicly
      createdAt: now,
      updatedAt: now,
    });

    // Record author vote
    await ctx.db.insert("issueVotes", {
      issueId,
      userId: user._id,
      createdAt: now,
    });

    // If initial evidence provided, record it with pending approvalStatus
    if (args.evidenceStorageId) {
      await ctx.db.insert("evidence", {
        issueId,
        uploadedBy: user._id,
        uploadedByName: user.name,
        storageId: args.evidenceStorageId,
        mediaType: args.mediaType || "image",
        fileName: args.fileName || "evidence",
        fileSize: args.fileSize || 0,
        approvalStatus: "pending",
        createdAt: now,
      });
    }

    return issueId;
  },
});

export const listTopTrending = query({
  args: {},
  handler: async (ctx) => {
    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_voteCount")
      .order("desc")
      .collect();

    const top = allIssues.find((i) => i.status.toLowerCase() !== "resolved" && i.status.toLowerCase() !== "reported");

    if (!top) return null;

    const media = await ctx.db
      .query("evidence")
      .withIndex("by_issueId", (q) => q.eq("issueId", top._id))
      .first();

    const mediaUrl = media ? await ctx.storage.getUrl(media.storageId) : null;

    return {
      ...top,
      mediaUrl,
    };
  },
});

export const listResolved = query({
  args: {},
  handler: async (ctx) => {
    const resolved = await ctx.db
      .query("issues")
      .withIndex("by_status", (q) => q.eq("status", "Resolved"))
      .order("desc")
      .collect();

    return await Promise.all(
      resolved.map(async (issue) => {
        const originalMedia = await ctx.db
          .query("evidence")
          .withIndex("by_issueId", (q) => q.eq("issueId", issue._id))
          .first();

        const beforeUrl = originalMedia ? await ctx.storage.getUrl(originalMedia.storageId) : null;
        let afterUrl = issue.resolutionEvidenceUrl || null;
        if (issue.resolutionEvidenceStorageId && !afterUrl) {
          afterUrl = await ctx.storage.getUrl(issue.resolutionEvidenceStorageId);
        }

        return {
          ...issue,
          beforeUrl,
          afterUrl,
        };
      })
    );
  },
});

export const listCitizenResolved = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const raw = args.username.trim().toLowerCase();
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find(
      (u) =>
        u.username.toLowerCase() === raw ||
        u.name.toLowerCase() === raw ||
        u.name.toLowerCase().replace(/\s+/g, "_") === raw ||
        String(u._id) === raw
    );

    let resolved = [];
    if (user) {
      resolved = await ctx.db
        .query("issues")
        .withIndex("by_createdBy", (q) => q.eq("createdBy", user._id))
        .filter((q) => q.eq(q.field("status"), "Resolved"))
        .collect();
    } else {
      const allResolved = await ctx.db
        .query("issues")
        .withIndex("by_status", (q) => q.eq("status", "Resolved"))
        .collect();
      resolved = allResolved.filter(
        (i) =>
          i.createdByName.toLowerCase() === raw ||
          i.createdByName.toLowerCase().replace(/\s+/g, "_") === raw
      );
    }

    return await Promise.all(
      resolved.map(async (issue) => {
        const originalMedia = await ctx.db
          .query("evidence")
          .withIndex("by_issueId", (q) => q.eq("issueId", issue._id))
          .first();

        const beforeUrl = originalMedia ? await ctx.storage.getUrl(originalMedia.storageId) : null;
        let afterUrl = issue.resolutionEvidenceUrl || null;
        if (issue.resolutionEvidenceStorageId && !afterUrl) {
          afterUrl = await ctx.storage.getUrl(issue.resolutionEvidenceStorageId);
        }

        return {
          ...issue,
          beforeUrl,
          afterUrl,
        };
      })
    );
  },
});

export const listMap = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let issues = await ctx.db.query("issues").collect();

    if (args.category && args.category !== "all") {
      issues = issues.filter((i) => i.category.toLowerCase().includes(args.category!.toLowerCase()));
    }

    if (args.status) {
      issues = issues.filter((i) => i.status.toLowerCase() === args.status!.toLowerCase());
    }

    return issues.map((i) => ({
      _id: i._id,
      title: i.title,
      category: i.category,
      status: i.status,
      voteCount: i.voteCount,
      latitude: i.latitude,
      longitude: i.longitude,
      address: i.address,
      district: i.district,
      state: i.state,
      createdAt: i.createdAt,
    }));
  },
});

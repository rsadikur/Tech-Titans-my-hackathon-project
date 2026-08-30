import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existingIssues = await ctx.db.query("issues").collect();
    const existingUsers = await ctx.db.query("users").collect();
    if (existingIssues.length > 0) {
      return "Issues already seeded";
    }

    const now = Date.now();

    // 1. Get or Create Users
    let neeraj = existingUsers.find((u) => u.username === "neeraj_gupta");
    let priya = existingUsers.find((u) => u.username === "priya_sharma");
    let admin = existingUsers.find((u) => u.username === "admin");

    let neerajId = neeraj?._id;
    if (!neerajId) {
      neerajId = await ctx.db.insert("users", {
        name: "Neeraj Gupta",
        username: "neeraj_gupta",
        email: "neeraj.gupta@civicpulse.org",
        contactNumber: "+91 98765 43210",
        passwordHash: "password123",
        fullAddress: "Block 18, LPU, Chiheru Khusropur Link Road, Law gate, Phagwara, Kapurthala, Punjab, 144411",
        localArea: "Law Gate, LPU",
        district: "Kapurthala",
        state: "Punjab",
        pinCode: "144411",
        latitude: 31.2536,
        longitude: 75.7037,
        role: "citizen",
        createdAt: now - 86400000 * 10,
        updatedAt: now,
      });
    }

    let priyaId = priya?._id;
    if (!priyaId) {
      priyaId = await ctx.db.insert("users", {
        name: "Priya Sharma",
        username: "priya_sharma",
        email: "priya.sharma@civicpulse.org",
        contactNumber: "+91 98123 45678",
        passwordHash: "password123",
        fullAddress: "GT Road, Phagwara, Punjab 144401",
        localArea: "GT Road",
        district: "Kapurthala",
        state: "Punjab",
        pinCode: "144401",
        latitude: 31.224,
        longitude: 75.7708,
        role: "citizen",
        createdAt: now - 86400000 * 8,
        updatedAt: now,
      });
    }

    const adminId = await ctx.db.insert("users", {
      name: "CivicPulse Admin",
      username: "admin",
      email: "admin@civicpulse.gov.in",
      contactNumber: "+91 1800 111 222",
      passwordHash: "admin123",
      fullAddress: "Municipal Corporation Secretariat, Punjab",
      localArea: "Civil Lines",
      district: "Kapurthala",
      state: "Punjab",
      pinCode: "144401",
      latitude: 31.224,
      longitude: 75.7708,
      role: "admin",
      createdAt: now - 86400000 * 30,
      updatedAt: now,
    });

    // 2. Create Issues
    const issue1Id = await ctx.db.insert("issues", {
      title: "Severe Deep Potholes on Law Gate Road",
      description: "Multiple deep potholes after recent monsoon rain causing heavy traffic jams and vehicle damage near Block 18.",
      category: "Road Damage",
      latitude: 31.2536,
      longitude: 75.7037,
      address: "Block 18, LPU, Chiheru Khusropur Link Road, Law gate, Phagwara",
      localArea: "Law Gate",
      district: "Kapurthala",
      state: "Punjab",
      pinCode: "144411",
      createdBy: priyaId,
      createdByName: "Priya Sharma",
      voteCount: 38,
      status: "Resolved",
      resolvedAt: now - 86400000 * 1,
      resolvedBy: "Municipal PWD Division (Verified by Admin)",
      resolutionReview: "The damaged road section was completely resurfaced with hot-mix asphalt and all deep potholes were leveled. Traffic flow is now smooth.",
      resolutionEvidenceUrl: "https://images.unsplash.com/photo-1578874691223-a49626e8517e?w=1000&auto=format&fit=crop&q=80",
      resolutionNotes: "Completed under Municipal Ward 12 Urgent Works.",
      createdAt: now - 86400000 * 5,
      updatedAt: now - 86400000 * 1,
    });

    const issue2Id = await ctx.db.insert("issues", {
      title: "Broken Main Pipeline Clean Water Leakage",
      description: "Drinking water pipe breached under footpath, continuous leak for 48 hours wasting water.",
      category: "Water / Drainage",
      latitude: 31.2542,
      longitude: 75.7045,
      address: "Chiheru Link Road, Near Gate 4, Phagwara",
      localArea: "Chiheru",
      district: "Kapurthala",
      state: "Punjab",
      pinCode: "144411",
      createdBy: neerajId,
      createdByName: "Neeraj Gupta",
      voteCount: 29,
      status: "Verified",
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    });

    const issue3Id = await ctx.db.insert("issues", {
      title: "Garbage Dump Overflowing on Public Walkway",
      description: "Commercial plastic waste accumulated outside park perimeter blocking pedestrian access.",
      category: "Garbage",
      latitude: 31.229,
      longitude: 75.765,
      address: "Model Town Main Market, Phagwara",
      localArea: "Model Town",
      district: "Kapurthala",
      state: "Punjab",
      pinCode: "144401",
      createdBy: neerajId,
      createdByName: "Neeraj Gupta",
      voteCount: 22,
      status: "In Progress",
      createdAt: now - 86400000 * 1,
      updatedAt: now,
    });

    const issue4Id = await ctx.db.insert("issues", {
      title: "Non-Functional Streetlights on Highway Link",
      description: "Complete dark stretch over 400m creating safety hazard for evening commuters.",
      category: "Broken Streetlight",
      latitude: 31.248,
      longitude: 75.712,
      address: "Chiheru Bypass Bridge, Kapurthala",
      localArea: "Chiheru",
      district: "Kapurthala",
      state: "Punjab",
      pinCode: "144411",
      createdBy: priyaId,
      createdByName: "Priya Sharma",
      voteCount: 16,
      status: "Verified",
      createdAt: now - 3600000 * 18,
      updatedAt: now,
    });

    // 3. Create Votes
    await ctx.db.insert("issueVotes", { issueId: issue1Id, userId: priyaId, createdAt: now });
    await ctx.db.insert("issueVotes", { issueId: issue1Id, userId: neerajId, createdAt: now });
    await ctx.db.insert("issueVotes", { issueId: issue2Id, userId: neerajId, createdAt: now });
    await ctx.db.insert("issueVotes", { issueId: issue2Id, userId: priyaId, createdAt: now });
    await ctx.db.insert("issueVotes", { issueId: issue3Id, userId: neerajId, createdAt: now });

    // 4. Create Ideas for a Better Nation
    await ctx.db.insert("ideas", {
      title: "Digital Ward Monitoring & Fast-Track Grievance Resolution",
      description: "Implement QR-code based geo-fenced citizen verification for public infrastructure repairs with strict SLA timelines.",
      category: "Governance",
      scope: "National",
      createdBy: neerajId,
      createdByName: "Neeraj Gupta",
      voteCount: 84,
      createdAt: now - 86400000 * 4,
      updatedAt: now,
    });

    await ctx.db.insert("ideas", {
      title: "Automated Solar LED Streetlighting with Fault Detection",
      description: "Equip municipal streetlights with IoT sensors that automatically alert maintenance teams when bulbs fail.",
      category: "Infrastructure",
      scope: "State",
      district: "Kapurthala",
      state: "Punjab",
      createdBy: priyaId,
      createdByName: "Priya Sharma",
      voteCount: 65,
      createdAt: now - 86400000 * 3,
      updatedAt: now,
    });

    await ctx.db.insert("ideas", {
      title: "Smart Waste Segregation & Organic Composting Hubs",
      description: "Community-level decentralized composting units to divert 70% of organic wet waste from overflowing landfills.",
      category: "Environment",
      scope: "District",
      district: "Kapurthala",
      state: "Punjab",
      createdBy: neerajId,
      createdByName: "Neeraj Gupta",
      voteCount: 52,
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    });

    await ctx.db.insert("ideas", {
      title: "Primary Healthcare Clinic Tele-Consultation Kiosks",
      description: "Install 24/7 video telemedicine access points in rural primary health centres connecting with specialist doctors.",
      category: "Healthcare",
      scope: "National",
      createdBy: priyaId,
      createdByName: "Priya Sharma",
      voteCount: 48,
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    });

    await ctx.db.insert("ideas", {
      title: "Public Transit Real-Time GPS Tracking & Unified Card",
      description: "One unified digital mobility card and live bus arrival timings for state transport buses across Punjab.",
      category: "Transport",
      scope: "State",
      state: "Punjab",
      createdBy: neerajId,
      createdByName: "Neeraj Gupta",
      voteCount: 41,
      createdAt: now - 86400000 * 1,
      updatedAt: now,
    });

    await ctx.db.insert("ideas", {
      title: "Vocational Skills Lab in Every Senior Secondary School",
      description: "Equip government high schools with modern coding, robotics, and electrical craft laboratories.",
      category: "Education",
      scope: "National",
      createdBy: priyaId,
      createdByName: "Priya Sharma",
      voteCount: 35,
      createdAt: now - 3600000 * 12,
      updatedAt: now,
    });

    return "Seeding completed successfully";
  },
});

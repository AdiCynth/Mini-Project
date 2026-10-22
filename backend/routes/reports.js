const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

// Get overall platform ESG stats
router.get("/impact", authenticate, async (req, res) => {
  try {
    const matchQuery = { action: "completed" };
    
    // Optional filtering for specific donor (if donor asks for their own report)
    if (req.user.role === "donor") {
      matchQuery.donor = req.user.id;
    } else if (req.query.donor_id) {
      matchQuery.donor = req.query.donor_id;
    }

    const impact = await AuditLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total_kg_saved: { $sum: "$weight_kg" },
          total_donations: { $sum: 1 }
        }
      }
    ]);

    const result = impact.length > 0 ? impact[0] : { total_kg_saved: 0, total_donations: 0 };
    
    // Simple metric calculation: 1kg food = approx 2.5kg CO2e saved from landfill
    result.co2_saved_kg = (result.total_kg_saved * 2.5).toFixed(2);
    // 1 meal = approx 0.5kg
    result.meals_equivalent = Math.floor(result.total_kg_saved * 2);

    res.json({ impact: result });
  } catch (err) {
    console.error("Impact report error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Get monthly breakdown for charts
router.get("/monthly", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const monthlyData = await AuditLog.aggregate([
      { $match: { action: "completed" } },
      {
        $group: {
          _id: { $month: "$created_at" },
          total_kg_saved: { $sum: "$weight_kg" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ monthly: monthlyData });
  } catch (err) {
    console.error("Monthly report error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;

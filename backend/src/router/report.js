const express = require('express');
const reportRouter = express.Router();
const { Report } = require('../models/Reports');
const { userAuth } = require('../middleware/authmiddle');
const { upload, cloudinary } = require('../cloudinary/cloudinary');
const { analyzeFileBase64 } = require('../gemini-api/gemini');

/* ================= HELPER FUNCTIONS ================= */

function detectAbnormal(vitals) {
    return vitals.map(v => {
        let status = "normal";
        const name = v.name?.toLowerCase() || "";

        if (name.includes("sugar") && v.value > 100) status = "high";
        if (name.includes("hba1c") && v.value > 5.7) status = "high";
        if (name.includes("bp") && v.value > 130) status = "high";

        return { ...v, status };
    });
}

function generateRiskFlags(vitals) {
    const risks = [];

    const sugar = vitals.find(v => v.name?.toLowerCase().includes("sugar"));
    const hba1c = vitals.find(v => v.name?.toLowerCase().includes("hba1c"));
    const bp = vitals.find(v => v.name?.toLowerCase().includes("bp"));

    if (sugar?.value > 110 && hba1c?.value >= 6) {
        risks.push("⚠️ Prediabetes risk detected");
    }

    if (bp?.value > 140) {
        risks.push("⚠️ Hypertension risk");
    }

    return risks;
}

function generateSmartTitle(parsed, vitals) {
    let title = parsed.report_type || "Medical Report";

    // 🔥 Find abnormal vitals
    const abnormal = vitals.find(
        (v) => v.status === "high" || v.status === "low"
    );

    if (abnormal) {
        title += ` – ${abnormal.name} ${abnormal.status}`;
    }

    return title;
}

/* ================= UPLOAD ROUTE ================= */

reportRouter.post('/upload', userAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }

        const fileUrl = req.file.path;
        const publicId = req.file.filename;
        const mimeType = req.file.mimetype;

        console.log("📁 File URL:", fileUrl);

        // 🔥 Fetch file
        const fileResponse = await fetch(fileUrl);

        if (!fileResponse.ok) {
            throw new Error("Failed to fetch file from Cloudinary");
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const base64File = Buffer.from(arrayBuffer).toString("base64");

        console.log("🤖 Sending to AI...");

        // 🔥 AI analysis
        const ai = await analyzeFileBase64(base64File, mimeType);

        console.log("🤖 AI Response Type:", ai?.type);

        // ✅ Safe fallback
        const parsed = ai?.parsed || {
            vitals: [],
            summary: "No AI data available",
            report_type: "Unknown Report",
            recommendations: [],
            confidence: "low"
        };

        console.log("📊 Parsed Vitals:", parsed.vitals);

        // 🔥 Safe vitals handling
        const processedVitals = Array.isArray(parsed.vitals)
            ? detectAbnormal(parsed.vitals)
            : [];

        // 🔥 Risk detection
        const riskFlags = generateRiskFlags(processedVitals);

        // 🔥 Generate smart title
        const smartTitle = generateSmartTitle(parsed, processedVitals);

        // 🔥 Save to DB
        const report = await Report.create({
            user: req.user._id,
            filename: req.file.originalname,
            fileUrl,
            public_id: publicId,

            title: smartTitle, // ✅ NEW (IMPORTANT)

            report_type: parsed.report_type || "General Report",
            summary: parsed.summary || "",

            vitals: processedVitals,
            risk_flags: riskFlags,
            recommendations: Array.isArray(parsed.recommendations)
                ? parsed.recommendations
                : [],
            confidence: parsed.confidence || "low",

            createdAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'Report uploaded & analyzed successfully ✅',
            report
        });

    } catch (err) {
        console.error("❌ Upload Error:", err);
        return res.status(500).json({
            success: false,
            message: 'Server error while uploading report',
            error: err.message
        });
    }
});

/* ================= FETCH REPORTS ================= */

reportRouter.get('/myreports', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.json({ success: true, reports });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
});

/* ================= INSIGHTS ================= */

reportRouter.get('/insights', userAuth, async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });

        const insights = reports.map((r) => ({
            _id: r._id,
            reportTitle: r.title || r.report_type || r.filename,

            summary: r.summary,
            risk_flags: r.risk_flags,
            vitals: r.vitals,

            recommendations: r.recommendations || [],
            report_type: r.report_type || "",
            date: r.createdAt
        }));

        return res.status(200).json({
            success: true,
            message: 'Insights fetched successfully ✅',
            insights
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching insights',
            error: error.message
        });
    }
});

/* ================= SINGLE REPORT ================= */

reportRouter.get('/:id', userAuth, async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        return res.json({ success: true, report });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

/* ================= DELETE REPORT ================= */

reportRouter.delete('/:id', userAuth, async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        if (report.public_id) {
            await cloudinary.uploader.destroy(report.public_id);
        }

        await Report.findByIdAndDelete(report._id);

        return res.status(200).json({
            success: true,
            message: 'Report deleted successfully ✅'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error while deleting report',
            error: error.message
        });
    }
});

module.exports = { reportRouter };
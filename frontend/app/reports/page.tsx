"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import Link from "next/link";

import {
    FaFileAlt,
    FaTrash,
    FaChevronDown,
    FaDownload,
    FaEye,
} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Report {
    _id: string;
    filename: string;
    fileUrl: string;
    title: string;
    dateSeen: string;
    summary: string;
}

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`${API_URL}/report/myreports`, {
                    credentials: "include",
                });
                const data = await res.json();
                const list = data.reports || [];
                setReports(list);

                // ✅ First open automatically
                if (list.length > 0) {
                    setOpenId(list[0]._id);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // ✅ Delete
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Delete Report?",
            text: "This cannot be undone",
            icon: "warning",
            showCancelButton: true,
        });

        if (!result.isConfirmed) return;

        try {
            await fetch(`${API_URL}/report/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            setReports((prev) => prev.filter((r) => r._id !== id));
        } catch (err: any) {
            Swal.fire("Error", err.message, "error");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Your Reports</h1>

            {reports.length === 0 ? (
                <p className="text-gray-400">
                    No reports uploaded yet.
                </p>
            ) : (
                reports.map((r) => {
                    const isOpen = openId === r._id;

                    return (
                        <div
                            key={r._id}
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition"
                        >
                            {/* HEADER */}
                            <div
                                onClick={() => setOpenId(isOpen ? null : r._id)}
                                className="cursor-pointer flex justify-between items-center p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <FaFileAlt className="text-gray-400 mt-1" />

                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {r.title || r.filename}
                                        </h3>

                                        <p className="text-xs text-gray-400">
                                            {r.dateSeen || "Unknown Date"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/report-page/${r._id}`}
                                        className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
                                    >
                                        <FaEye /> View
                                    </Link>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(r._id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>

                                    <FaChevronDown
                                        className={`text-gray-400 transition ${isOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* BODY */}
                            {isOpen && (
                                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">

                                    {/* SUMMARY */}
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {r.summary || "No summary available"}
                                    </p>

                                    {/* FILE */}
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>{r.filename}</span>

                                        <a
                                            href={r.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm"
                                        >
                                            <FaDownload className="text-xs" />
                                            Download
                                        </a>
                                    </div>

                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </main>
    );
};

export default Reports;
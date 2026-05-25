'use client';

import React, { useState, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';

export default function ImageCompressor() {
    const [file, setFile] = useState<File | null>(null);
    const [quality, setQuality] = useState(0.8);
    const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number>(0);
    const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [originalWidth, setOriginalWidth] = useState<number>(0);
    const [originalHeight, setOriginalHeight] = useState<number>(0);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(1);
    const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const aspectPresets = [
        { label: 'Original', value: 'original' },
        { label: '16:9', value: 16 / 9 },
        { label: '4:3', value: 4 / 3 },
        { label: '1:1', value: 1 },
        { label: '3:2', value: 3 / 2 },
        { label: 'Free Resize', value: 'free' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setOriginalSize(selectedFile.size);

            // অরিজিনাল ইমেজের জন্য একটি পার্মানেন্ট প্রিভিউ URL তৈরি করা হচ্ছে
            const objectUrl = URL.createObjectURL(selectedFile);
            setOriginalPreviewUrl(objectUrl);

            const img = new Image();
            img.src = objectUrl;
            img.onload = () => {
                setWidth(img.width);
                setHeight(img.height);
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setAspectRatio(img.width / img.height);
                setOriginalAspectRatio(img.width / img.height);
            };
        }
    };

    useEffect(() => {
        if (!file || width === 0 || height === 0) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Canvas এর সাইজ ইউজার ইনপুট অনুযায়ী সেট করা
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Canvas থেকে ইমেজকে ব্লব (Blob) এ রূপান্তর করা এবং কোয়ালিটি সেট করা
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        setCompressedSize(blob.size);
                        setCompressedBlob(blob);
                    }
                },
                'image/jpeg', // আউটপুট ফরম্যাট
                quality       // কম্প্রেসড কোয়ালিটি (0.1 - 1.0)
            );
        };
        return () => URL.revokeObjectURL(objectUrl);
    }, [file, quality, width, height]);

    useEffect(() => {
        // মেমোরি লিক রোধ করতে কম্পোনেন্ট আনমাউন্ট বা ফাইল চেঞ্জের সময় URL ক্লিনআপ
        return () => {
            if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
        };
    }, [originalPreviewUrl]);

    useEffect(() => {
        if (!compressedBlob) return;

        const url = URL.createObjectURL(compressedBlob);
        setPreviewUrl(url);

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [compressedBlob]);

    const handleDownload = () => {
        if (compressedBlob && file) {
            saveAs(compressedBlob, `compressed_${file.name.split('.')[0]}.jpg`);
        }
    };

    const handleReset = () => {
        setWidth(originalWidth);
        setHeight(originalHeight);
        setAspectRatio(originalAspectRatio);
        setMaintainAspectRatio(true);
    };

    const handlePresetChange = (val: string) => {
        const preset = aspectPresets.find(p => p.label === val);
        if (!preset) return;

        if (preset.value === 'free') {
            setMaintainAspectRatio(false);
        } else {
            const newRatio = preset.value === 'original' ? originalAspectRatio : (preset.value as number);
            setAspectRatio(newRatio);
            setMaintainAspectRatio(true);
            setHeight(Math.round(width / newRatio));
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto border rounded-xl shadow-sm bg-white dark:bg-gray-900 mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Image Compressor</h1>

            <div className="mb-8 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-gray-400">Supported: JPG, PNG, WebP (Exports as JPEG)</p>
            </div>

            {file && (
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Aspect Ratio Preset</label>
                        <select
                            onChange={(e) => handlePresetChange(e.target.value)}
                            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {aspectPresets.map((p) => (
                                <option key={p.label} value={p.label}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Width (px)</label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setWidth(val);
                                    if (maintainAspectRatio) setHeight(Math.round(val / aspectRatio));
                                }}
                                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Height (px)</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setHeight(val);
                                    if (maintainAspectRatio) setWidth(Math.round(val * aspectRatio));
                                }}
                                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={maintainAspectRatio}
                                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            Maintain Aspect Ratio
                        </label>
                        <button
                            onClick={handleReset}
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Reset to Original
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Compression Quality</span>
                            <span>{Math.round(quality * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0.1" max="1" step="0.01"
                            value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {previewUrl && originalPreviewUrl && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Comparison</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Original Preview */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Original</p>
                                    <div className="rounded-lg overflow-hidden border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-center p-2">
                                        <img src={originalPreviewUrl} alt="Original" className="max-h-64 w-auto object-contain" />
                                    </div>
                                </div>
                                {/* Compressed Preview */}
                                <div className="space-y-2">
                                    <p className="text-[10px] text-center text-blue-500 font-bold uppercase">Compressed</p>
                                    <div className="relative group rounded-lg overflow-hidden border border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 flex justify-center p-2">
                                        <img
                                            src={previewUrl}
                                            alt="Compressed preview"
                                            className="max-h-64 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            {width} × {height}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="block text-xs text-gray-500">Original Size</span>
                            <span className="font-mono">{(originalSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <span className="block text-xs text-blue-500">Compressed Size</span>
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{(compressedSize / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        Download Compressed Image
                    </button>

                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </div>
    );
}
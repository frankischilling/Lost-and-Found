import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function CreateLostPost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [itemName, setItemName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [locationFound, setLocationFound] = useState("");
    const [dateFound, setDateFound] = useState("");
    const [tags, setTags] = useState("");
    const [privacy, setPrivacy] = useState<"anyone" | "school_members" | "private">("anyone");
    const [submitting, setSubmitting] = useState(false);
    const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"] as const;
    const maxFileSizeBytes = 10 * 1024 * 1024; // 10MB
    const maxImages = 10;

    async function compressImage(file: File, targetMaxBytes = maxFileSizeBytes): Promise<File> {
        // Only attempt compression for JPEG/PNG/WebP; skip GIF
        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) return file;
        try {
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return file;
            // Scale down if very large (cap longest side to 2000px)
            const maxDim = 2000;
            const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
            canvas.width = Math.round(bitmap.width * scale);
            canvas.height = Math.round(bitmap.height * scale);
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            // Iteratively lower quality until under targetMaxBytes or floor
            const type = file.type === "image/png" ? "image/png" : "image/jpeg";
            let quality = type === "image/png" ? 0.92 : 0.85;
            for (let i = 0; i < 5; i++) {
                const blob: Blob = await new Promise((resolve) =>
                    canvas.toBlob((b) => resolve(b as Blob), type, quality)
                );
                if (!blob) break;
                if (blob.size <= targetMaxBytes || quality <= 0.5) {
                    return new File([blob], file.name, { type });
                }
                quality -= 0.1;
            }
            // Fallback: return last attempt
            const finalBlob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), type, 0.5));
            return finalBlob ? new File([finalBlob], file.name, { type }) : file;
        } catch {
            return file;
        }
    }

    // Camera controls
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: "environment" } },
                    audio: false,
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error("Camera start failed:", err);
                setShowCamera(false);
            }
        }
        if (showCamera) startCamera();
        return () => {
            // Stop tracks on hide
            const s = streamRef.current;
            if (s) {
                s.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        };
    }, [showCamera]);

    async function capturePhoto() {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9));
        if (!blob) return;
        let file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        // Compress if needed
        if (file.size > maxFileSizeBytes) {
            file = await compressImage(file);
        }
        // Append to photoFiles (FileList replacement via DataTransfer)
        const currentCount = photoFiles ? photoFiles.length : 0;
        if (currentCount >= maxImages) {
            alert(`Maximum ${maxImages} images allowed. Please remove an image before capturing another.`);
            return;
        }
        const dt = new DataTransfer();
        if (photoFiles) Array.from(photoFiles).forEach((f) => dt.items.add(f));
        dt.items.add(file);
        setPhotoFiles(dt.files);
    }
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Upload photos first if provided
        let uploadedPhotoIds: string[] | null = null;
        if (photoFiles && photoFiles.length > 0) {
            const formData = new FormData();
            // Validate and compress as needed
            const filesArray = Array.from(photoFiles);
            for (const original of filesArray) {
                if (!allowedTypes.includes(original.type as (typeof allowedTypes)[number])) {
                    setError("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
                    setSubmitting(false);
                    return;
                }
                let file = original;
                if (file.size > maxFileSizeBytes) {
                    // Try compression; if still too big, reject
                    file = await compressImage(file);
                    if (file.size > maxFileSizeBytes) {
                        setError("One or more files exceed the 10MB limit even after compression.");
                        setSubmitting(false);
                        return;
                    }
                }
                formData.append("photos", file);
            }
            const uploadUrl = import.meta.env.DEV
                ? "/api/upload_photo.php"
                : "https://project.frankhagan.online/upload_photo.php";
            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (!uploadRes.ok) {
                setError("Failed to upload photos");
                setSubmitting(false);
                return;
            }
            const uploadData: { status: string; photos?: Array<{ uuid: string }> } = await uploadRes.json();
            if (uploadData.status !== "success" || !uploadData.photos) {
                setError("Photo upload failed");
                setSubmitting(false);
                return;
            }
            uploadedPhotoIds = (uploadData.photos ?? []).map((p) => p.uuid).filter(Boolean);
        }

        const payload = {
            action: "create",
            title,
            post_type: "lost",
            item_name: itemName || title,
            description,
            content,
            location_found: locationFound || null,
            date_found: dateFound || null,
            photo_ids: uploadedPhotoIds,
            privacy,
            tags: tags
                ? tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                : null,
        };

        try {
            const url = import.meta.env.DEV ? "/api/posts.php" : "https://project.frankhagan.online/posts.php";
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to create post");
            // optional: const data = await res.json();
            navigate("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ProtectedRoute>
            <main className="pt-16 p-4 container mx-auto">
                <div className="m-auto w-full lg:w-2/5">
                    <h1 className="text-2xl font-bold mb-2 text-center">Create Lost Item Report</h1>
                    <p className="text-center text-gray-600 mb-4">
                        Report an item you've lost. Provide as much detail as possible to help others identify and
                        return your item.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-blue-800 text-sm">
                            💡 Before creating a report, check if someone has already{" "}
                            <Link to="/browse/found" className="font-semibold underline hover:text-blue-900">
                                found your item
                            </Link>
                            .
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block font-medium" htmlFor="photos">
                                Photos (JPEG, PNG, GIF, WebP)
                            </label>
                            <input
                                type="file"
                                id="photos"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > maxImages) {
                                        alert(
                                            `Maximum ${maxImages} images allowed. Only the first ${maxImages} will be used.`
                                        );
                                        const dt = new DataTransfer();
                                        Array.from(files)
                                            .slice(0, maxImages)
                                            .forEach((f) => dt.items.add(f));
                                        setPhotoFiles(dt.files);
                                    } else {
                                        setPhotoFiles(files);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById("photos")?.click()}
                                className="w-full border-2 border-dashed border-blue-400 bg-blue-50 p-4 rounded text-center hover:bg-blue-100 transition-colors"
                            >
                                <p className="font-medium text-blue-700">
                                    {photoFiles && photoFiles.length > 0
                                        ? `${photoFiles.length} / ${maxImages} images selected`
                                        : "Click to select images"}
                                </p>
                            </button>
                            {/* Camera capture UI */}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    className="px-3 py-2 bg-gray-800 text-white rounded"
                                    onClick={() => setShowCamera((v) => !v)}
                                >
                                    {showCamera ? "Close Camera" : "Open Camera"}
                                </button>
                                {showCamera && (
                                    <div className="space-y-2">
                                        <video ref={videoRef} className="w-full rounded bg-black" playsInline muted />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="px-3 py-2 bg-blue-600 text-white rounded"
                                                onClick={capturePhoto}
                                            >
                                                Capture Photo
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500">Tip: Use landscape for wider shots.</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                Tip: Use the camera on mobile to take a photo directly. Maximum {maxImages} images.
                            </p>
                            {photoFiles && photoFiles.length > 0 && (
                                <p className="text-sm font-medium">
                                    {photoFiles.length} / {maxImages} images selected
                                </p>
                            )}
                            {photoFiles && photoFiles.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {Array.from(photoFiles).map((f, idx) => (
                                        <div
                                            key={idx}
                                            className="relative border rounded p-2 flex flex-col items-center"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const dt = new DataTransfer();
                                                    Array.from(photoFiles).forEach((file, i) => {
                                                        if (i !== idx) dt.items.add(file);
                                                    });
                                                    setPhotoFiles(dt.files.length > 0 ? dt.files : null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 z-0"
                                            >
                                                ×
                                            </button>
                                            <img
                                                src={URL.createObjectURL(f)}
                                                alt={f.name}
                                                className="w-full h-24 object-cover rounded"
                                            />
                                            <span className="text-xs mt-1 truncate w-full">{f.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium" htmlFor="title">
                                Title
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full border p-2"
                                id="title"
                            />
                        </div>

                        <div>
                            <label className="block font-medium" htmlFor="itemName">
                                Item name
                            </label>
                            <input
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                required
                                className="w-full border p-2"
                                id="itemName"
                            />
                        </div>

                        <div>
                            <label className="block font-medium" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border p-2"
                                id="description"
                            />
                        </div>

                        <div>
                            <label className="block font-medium" htmlFor="content">
                                Details / Additional Info
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full border p-2"
                                id="content"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium" htmlFor="locationFound">
                                    Where lost
                                </label>
                                <input
                                    value={locationFound}
                                    onChange={(e) => setLocationFound(e.target.value)}
                                    className="w-full border p-2"
                                    id="locationFound"
                                />
                            </div>
                            <div>
                                <label className="block font-medium" htmlFor="dateFound">
                                    Date lost
                                </label>
                                <input
                                    type="date"
                                    value={dateFound}
                                    onChange={(e) => setDateFound(e.target.value)}
                                    className="w-full border p-2"
                                    id="dateFound"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium" htmlFor="tags">
                                Tags (comma separated)
                            </label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full border p-2"
                                id="tags"
                            />
                        </div>

                        <div>
                            <label className="block font-medium" htmlFor="privacy">
                                Privacy Setting
                            </label>
                            <select
                                value={privacy}
                                onChange={(e) => setPrivacy(e.target.value as "anyone" | "school_members" | "private")}
                                className="w-full border p-2 rounded bg-white cursor-pointer"
                                id="privacy"
                            >
                                <option value="anyone">Anyone (Everyone can see)</option>
                                <option value="school_members">
                                    School Members Only (Wentworth students, staff, and faculty)
                                </option>
                                <option value="private">Private (Only you and admins can see)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Choose who can see this post to protect your privacy. Note: Admins can always view
                                private posts to help match items with their rightful owners.
                            </p>
                        </div>

                        {error && <p className="text-red-600">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                {submitting ? "Submitting..." : "Create Lost Post"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </ProtectedRoute>
    );
}

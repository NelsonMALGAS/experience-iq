'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
    images: string[];
    title?: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [imageError, setImageError] = useState<Set<number>>(new Set());

    if (!images || images.length === 0) {
        return null;
    }

    const handleImageError = (index: number) => {
        setImageError(prev => new Set([...prev, index]));
    };

    const openLightbox = (index: number) => {
        setSelectedImage(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const goToPrevious = () => {
        if (selectedImage === null) return;
        setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    };

    const goToNext = () => {
        if (selectedImage === null) return;
        setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        {title || 'Attachments'} ({images.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={cn(
                        "grid gap-3",
                        images.length === 1 && "grid-cols-1",
                        images.length === 2 && "grid-cols-2",
                        images.length >= 3 && "grid-cols-2 md:grid-cols-3"
                    )}>
                        {images.map((imageUrl, index) => (
                            <div
                                key={index}
                                className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
                                onClick={() => openLightbox(index)}
                            >
                                {!imageError.has(index) ? (
                                    <>
                                        <Image
                                            src={imageUrl}
                                            alt={`Attachment ${index + 1}`}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={() => handleImageError(index)}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <ImageIcon className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Lightbox Modal */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        onClick={closeLightbox}
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>

                    {/* Navigation buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevious();
                                }}
                            >
                                <ChevronLeft className="h-6 w-6 text-white" />
                            </button>
                            <button
                                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                            >
                                <ChevronRight className="h-6 w-6 text-white" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[selectedImage]}
                            alt={`Attachment ${selectedImage + 1}`}
                            fill
                            className="object-contain"
                            onError={() => handleImageError(selectedImage)}
                        />
                    </div>

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                        <span className="text-white text-sm font-medium">
                            {selectedImage + 1} / {images.length}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}
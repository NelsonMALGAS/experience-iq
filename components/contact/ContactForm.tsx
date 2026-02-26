"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser"

export default function ContactForm() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        propertyName: "",
        subject: "",
        message: "",
        time: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null)

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.fullName.trim()) {
            toast.error("Please enter your full name");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error("Please enter your email address");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (!formData.propertyName.trim()) {
            toast.error("Please enter your property name");
            return false;
        }
        if (!formData.subject.trim()) {
            toast.error("Please enter a subject");
            return false;
        }
        if (!formData.message.trim()) {
            toast.error("Please enter your message");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        if (!formRef.current) {
            toast.error("🚨 Error", {
                description: "Form reference is missing. Please refresh and try again."
            })
            return
        }

        try {

            await emailjs.sendForm(
                process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID!,
                process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!,
                formRef.current,
                process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY
            );

            toast.success("Message sent successfully!", {
                description: "We'll get back to you within 24 hours.",
                duration: 5000
            });

            // Reset form
            setFormData({
                fullName: "",
                email: "",
                propertyName: "",
                subject: "",
                message: "",
                time: new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })
            });
        } catch (error) {
            console.error("Error: ", error)
            toast.error("Failed to send message", {
                description: "Please try again or email us directly.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                    Fill out the form below and our team will respond within 24 hours.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" ref={formRef}>
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">
                            Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="John Smith"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="h-11"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@hotel.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="h-11"
                        />
                    </div>

                    {/* Property Name */}
                    <div className="space-y-2">
                        <Label htmlFor="propertyName">
                            Property Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="propertyName"
                            name="propertyName"
                            type="text"
                            placeholder="Grand Hotel Cape Town"
                            value={formData.propertyName}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="h-11"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">
                            Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Enterprise plan inquiry"
                            value={formData.subject}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="h-11"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">
                            Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Tell us about your property and how ExperienceIQ can help..."
                            value={formData.message}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            rows={6}
                            className="resize-none"
                        />
                    </div>
                    {/* Time */}
                    <div className="opacity-0">
                        <Input
                            id="time"
                            type="hidden"
                            name="time"
                            value={new Date().toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}

                            className="h-11"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-xl"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                Send Message
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our{" "}
                        <a href="/policy" className="text-primary hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
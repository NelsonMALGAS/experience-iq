
"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';
import {
    Sparkles,
    Users,
    Building2,
    Shield,
    ArrowRight,
    Clock,
    CheckCircle2,
    BarChart3,
    QrCode,
    Bell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Footer from './Footer';

export default function LandingPage() {
    const router = useRouter();

    const handleRoleSelect = (role: UserRole) => {
        router.push(`/login?role=${role}`);
    };

    const features = [
        {
            icon: QrCode,
            title: 'QR-Based Access',
            description: 'Guests submit issues instantly via room QR codes'
        },
        {
            icon: Bell,
            title: 'Real-time Alerts',
            description: 'Staff receive instant notifications for new issues'
        },
        {
            icon: Clock,
            title: 'SLA Tracking',
            description: 'Automated escalation ensures timely resolution'
        },
        {
            icon: BarChart3,
            title: 'Analytics Dashboard',
            description: 'Track performance across all properties'
        }
    ];

    const roles = [
        {
            role: 'guest' as UserRole,
            icon: Users,
            title: 'Guest Portal',
            description: 'Report issues and track resolution status',
            color: 'from-blue-500 to-blue-600'
        },
        {
            role: 'staff' as UserRole,
            icon: Building2,
            title: 'Staff Dashboard',
            description: 'Manage and resolve guest issues efficiently',
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            role: 'admin' as UserRole,
            icon: Shield,
            title: 'Admin Console',
            description: 'Monitor operations across all properties',
            color: 'from-purple-500 to-purple-600'
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top Nav + Hero */}
            <section className="border-b border-border">

                <div className="container mx-auto px-4 py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium mb-8">
                        <Sparkles className="h-4 w-4 text-foreground" />
                        Service Recovery Platform
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto leading-tight">
                        Transform Guest Experience with{" "}
                        <span className="text-primary">Real-Time</span> Issue Resolution
                    </h1>

                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Empower your hospitality team to resolve guest issues before they become
                        complaints. Real-time tracking, SLA management, and insights.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Instant Notifications
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            SLA Compliance
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Multi-Property
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-muted">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Built for Hospitality Excellence
                        </h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                            Every feature designed to improve guest satisfaction and operational
                            efficiency
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <Card key={feature.title}>
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 mx-auto rounded-xl bg-primary flex items-center justify-center mb-4">
                                        <feature.icon className="h-7 w-7 text-primary-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role Selection */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Select Your Portal
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Choose your role to access the appropriate dashboard
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {roles.map((item) => (
                            <Card
                                key={item.role}
                                className="cursor-pointer hover:border-primary transition"
                                onClick={() => handleRoleSelect(item.role)}
                            >
                                <CardHeader className="text-center">
                                    <div className="w-16 h-16 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-4">
                                        <item.icon className="h-8 w-8 text-secondary-foreground" />
                                    </div>
                                    <CardTitle>{item.title}</CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <Button className="w-full">
                                        Enter
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold">94%</p>
                            <p className="text-primary-foreground/70 mt-2">SLA Compliance</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">45m</p>
                            <p className="text-primary-foreground/70 mt-2">Avg Resolution</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">4.8★</p>
                            <p className="text-primary-foreground/70 mt-2">
                                Guest Satisfaction
                            </p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">50+</p>
                            <p className="text-primary-foreground/70 mt-2">Properties</p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>



    );
}

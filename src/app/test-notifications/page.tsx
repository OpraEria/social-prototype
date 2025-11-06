"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeToPushNotifications, checkNotificationPermission } from "@/lib/notifications";

export default function NotificationTestPage() {
    const { data: session } = useSession();
    const [status, setStatus] = useState<string>("");
    const [permission, setPermission] = useState<NotificationPermission>("default");

    const checkPermission = () => {
        const perm = checkNotificationPermission();
        setPermission(perm);
        setStatus(`Current permission: ${perm}`);
    };

    const updateServiceWorker = async () => {
        setStatus("Updating service worker...");
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
            setStatus("Service worker unregistered. Refresh the page to re-register.");
        } catch (error) {
            setStatus(`Error: ${error}`);
        }
    };

    const requestPermission = async () => {
        if (!session?.user?.id) {
            setStatus("Please log in first");
            return;
        }

        setStatus("Requesting permission...");
        const subscription = await subscribeToPushNotifications(session.user.id);

        if (subscription) {
            setStatus("Successfully subscribed to notifications!");
            checkPermission();
        } else {
            setStatus("Failed to subscribe. Check console for errors.");
        }
    };

    const sendTestNotification = async () => {
        setStatus("Sending test notification...");

        try {
            const res = await fetch("/api/notifications/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: "Test Notification",
                    body: "This is a test notification from Gather!",
                    eventId: null
                })
            });

            const data = await res.json();
            setStatus(`Sent ${data.sent} notifications to ${data.total} users`);
        } catch (error) {
            setStatus(`Error: ${error}`);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Testing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Button onClick={updateServiceWorker} variant="destructive" className="w-full">
                                🔄 Update Service Worker (Unregister)
                            </Button>

                            <Button onClick={checkPermission} variant="outline" className="w-full">
                                Check Permission Status
                            </Button>

                            <Button onClick={requestPermission} className="w-full">
                                Subscribe to Notifications
                            </Button>

                            <Button onClick={sendTestNotification} variant="secondary" className="w-full">
                                Send Test Notification
                            </Button>
                        </div>

                        {status && (
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <p className="text-sm">{status}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Permission: {permission}
                                </p>
                            </div>
                        )}

                        <div className="text-sm text-muted-foreground space-y-2 mt-6">
                            <p><strong>Instructions:</strong></p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Click "Check Permission Status" to see current state</li>
                                <li>Click "Subscribe to Notifications" to enable notifications</li>
                                <li>Click "Send Test Notification" to test sending</li>
                            </ol>

                            <p className="mt-4"><strong>Notes:</strong></p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>You must be logged in</li>
                                <li>Service worker must be registered</li>
                                <li>Test notifications are sent to all users in your group</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

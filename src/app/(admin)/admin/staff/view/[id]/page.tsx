
"use client";

import { PlaceholderPage } from "@/components/PlaceholderPage";
import { User } from "lucide-react";
import { useParams } from 'next/navigation';

export default function ViewStaffPage() {
    const params = useParams();
    const { id } = params;

    return (
        <PlaceholderPage 
            title="View Staff Details"
            description={`Displaying full profile and details for staff member with ID: ${id}.`}
            icon={User}
            featureName="Staff Profile Viewer"
        />
    )
}


"use client";

import { PlaceholderPage } from "@/components/PlaceholderPage";
import { Edit } from "lucide-react";
import { useParams } from 'next/navigation';

export default function EditStaffPage() {
    const params = useParams();
    const { id } = params;

    return (
        <PlaceholderPage 
            title="Edit Staff Member"
            description={`You are currently editing the profile for staff member with ID: ${id}.`}
            icon={Edit}
            featureName="Staff Profile Editor"
        />
    )
}


"use client";

// This is the simplified version for testing the layout
export default function StudentProfilePage() {
  return (
    <div className="p-4 border-4 border-red-500 h-[300px] bg-blue-100">
      <h1 className="text-3xl font-bold mb-4 text-red-700">STUDENT PROFILE PAGE - SIMPLIFIED</h1>
      <p className="text-lg text-red-600">This is a temporary, simplified version of the student profile page to test the main layout.</p>
      <p className="text-lg text-red-600">If this page renders correctly (no shift to the right, content is centered within the main area next to the sidebar), then the layout issue is within the original complex content of this page.</p>
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-500">
        <p className="font-bold">Test Content Area</p>
        <p>More lines to ensure it takes some space.</p>
        <p>The red border around this entire blue box shows the boundary of this simplified page content.</p>
      </div>
    </div>
  );
}

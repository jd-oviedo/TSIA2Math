export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Optional: add a course-level header/nav here */}
      {children}
    </div>
  );
}
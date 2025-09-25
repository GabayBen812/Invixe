export default function MockProgressBar({
  progress = 0.3,
  width = 260,
  height = 40,
}: { progress?: number; width?: number; height?: number }) {
  const clamped = Math.max(0, Math.min(1, progress))

  return (
    <div
      className="relative rounded-full"
      style={{
        width,
        height,
        backgroundColor: '#FFFFFF', // רקע לבן
        border: '1px solid #E5E7EB', // גבול עדין כמו בפיגמה (אפשר להחליש או להוריד)
      }}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: width * clamped,
          backgroundColor: '#57D34D', // ירוק מהפיגמה
        }}
      />
    </div>
  )
}

import Card from "./Card";

export default function StatCard({ title, value, subtitle }) {
  return (
    <Card className="flex flex-col justify-center">
      <h3 className="text-secondary text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[#2D2433]">{value}</p>
      {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
    </Card>
  );
}

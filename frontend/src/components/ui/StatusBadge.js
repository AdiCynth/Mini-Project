export default function StatusBadge({ status }) {
  const config = {
    available: { bg: "bg-[#F5E4DA]", text: "text-[#A94733]", border: "border-[#EBC7B8]", label: "Available" },
    claimed: { bg: "bg-[#FFF3D5]", text: "text-[#765611]", border: "border-[#E8D39E]", label: "Claimed" },
    picked_up: { bg: "bg-[#EEE8F0]", text: "text-[#56405B]", border: "border-[#D7C9DA]", label: "Picked Up" },
    completed: { bg: "bg-[#F1EEE9]", text: "text-secondary", border: "border-subtle", label: "Completed" },
    expired: { bg: "bg-[#FBE9E4]", text: "text-[#9E4031]", border: "border-[#EEC6BB]", label: "Expired" },
    pending: { bg: "bg-[#FFF3D5]", text: "text-[#765611]", border: "border-[#E8D39E]", label: "Pending" },
  };

  const current = config[status.toLowerCase()] || config.available;

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded border text-xs font-medium ${current.bg} ${current.text} ${current.border} w-max`}>
      {current.label}
    </span>
  );
}

import Card from "./Card";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

export default function ListingCard({ listing, role = "receiver", onAction, actionLabel }) {
  // Format timestamps
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const pickupTime = `${formatTime(listing.pickup_window_start)} - ${formatTime(listing.pickup_window_end)}`;

  return (
    <Card className="hover:border-subtle transition-colors flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-[#2D2433] leading-tight">
              {listing.quantity} {listing.unit} {listing.item_name}
            </h3>
            <p className="text-sm text-secondary mt-1">{role === 'receiver' ? listing.donor_name : 'Your Listing'}</p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        <div className="space-y-1 mb-5">
          <p className="text-sm text-secondary">Pickup: <span className="text-[#2D2433]">{pickupTime}</span></p>
          {role === 'receiver' && listing.distance_km && (
            <p className="text-sm text-secondary">Distance: <span className="text-[#2D2433]">{listing.distance_km} km</span></p>
          )}
        </div>
      </div>

      {onAction && (
        <Button variant={listing.status === 'available' ? 'primary' : 'secondary'} className="w-full" onClick={() => onAction(listing)}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

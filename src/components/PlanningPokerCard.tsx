import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanningPokerCardProps {
  value: string | number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const PlanningPokerCard = ({ 
  value, 
  isSelected = false, 
  onClick, 
  className,
  disabled = false 
}: PlanningPokerCardProps) => {
  return (
    <Button
      variant="poker"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-32 w-24 text-2xl font-bold flex-col gap-2 relative overflow-hidden",
        "hover:animate-card-hover active:animate-card-select",
        isSelected && "gradient-primary border-accent shadow-magenta scale-105",
        className
      )}
    >
      <div className="text-3xl font-black">{value}</div>
      {value !== "?" && (
        <div className="text-xs opacity-70 font-normal">Points</div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-primary/30" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-accent/30" />
      
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
      )}
    </Button>
  );
};
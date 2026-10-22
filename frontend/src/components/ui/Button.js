export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = "px-4 py-2.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-sm";
  
  const variants = {
    primary: "bg-[#D45D43] hover:bg-[#A94733] text-white shadow-sm",
    secondary: "bg-[#F2E9DE] border border-subtle text-[#2D2433] hover:bg-[#EAE0D4]",
    outline: "bg-transparent border border-subtle text-[#2D2433] hover:bg-[#F2E9DE]",
    danger: "bg-transparent border border-[#EBC7B8] text-[#9E4031] hover:bg-[#FBE9E4]",
    ghost: "bg-transparent text-secondary hover:text-[#2D2433] hover:bg-[#F2E9DE]",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function Unfold() {
  return (
    <div className="relative flex min-h-[28rem] items-center justify-center transition-all duration-300">
      <div className="group transform-3d translate-3d relative h-96 w-60 border border-blue-300 duration-300 ease-out-cubic hover:-rotate-x-50 hover:-rotate-z-45">
        <div className="group-hover:-translate-z-20 h-32 w-60 border border-green-300 duration-1000 ease-out-cubic" />
        <div className="group-hover:-translate-z-20 h-32 w-60 border border-yellow-300 duration-1000 ease-out-cubic" />
        <div className="group-hover:-translate-z-20 h-32 w-60 border border-purple-300 duration-1000 ease-out-cubic" />
      </div>
    </div>
  );
}

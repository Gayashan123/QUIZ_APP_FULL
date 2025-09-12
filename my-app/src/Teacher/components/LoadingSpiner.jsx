export default  function Spinner({ size = "4" }) {
  return (
    <div className={`w-${size} h-${size} border-2 border-t-2 border-t-transparent border-gray-200 rounded-full animate-spin`} />
  );
}
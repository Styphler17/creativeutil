import logo from "@/assets/creativeutil-logo.png";

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = "Loading..." }: PageLoaderProps) => (
  <div className="flex items-center justify-center w-full py-16" role="status" aria-live="polite">
    <img
      src={logo}
      alt="CreativeUtil loader"
      className="h-16 w-16 animate-spin [animation-duration:3s]"
      draggable={false}
    />
    <span className="sr-only">{message}</span>
  </div>
);

export default PageLoader;

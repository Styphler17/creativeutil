import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { tools } from "@/config/tools";

interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Define breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', path: '/', icon: Home }
  ];

  // Add intermediate paths
  if (pathnames.length > 0) {
    if (pathnames[0] === 'tools') {
      breadcrumbItems.push({ name: 'Tools', path: '/tools' });

      if (pathnames.length > 1) {
        const toolId = pathnames[1];
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
          breadcrumbItems.push({ name: tool.title, path: `/tools/${toolId}` });
        }
      }
    } else {
      // Handle other routes like about, contact
      const routeName = pathnames[0].charAt(0).toUpperCase() + pathnames[0].slice(1);
      breadcrumbItems.push({ name: routeName, path: `/${pathnames[0]}` });
    }
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={item.path} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors flex items-center gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export { Breadcrumb };

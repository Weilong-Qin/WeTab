import { Button } from "./Button";

export interface BreadcrumbItem {
  id: string;
  label: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  label: string;
  onSelect: (id: string) => void;
}

export function Breadcrumbs({ items, label, onSelect }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label={label} className="breadcrumbs">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.id}>
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Button className="breadcrumbs__button" onClick={() => onSelect(item.id)} variant="subtle">
                  {item.label}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

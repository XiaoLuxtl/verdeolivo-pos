import React from "react";
import { cn } from "../../lib/utils";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  zebra?: boolean;
  hover?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, zebra = true, hover = true, ...props }, ref) => {
    const classes = ["table"];

    if (zebra) {
      classes.push("table-zebra");
    }
    if (hover) {
      classes.push("hover");
    }

    return <table className={cn(...classes, className)} ref={ref} {...props} />;
  }
);
Table.displayName = "Table";

const Thead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead className={cn(className)} ref={ref} {...props} />
));
Thead.displayName = "Thead";

const Tbody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody className={cn(className)} ref={ref} {...props} />
));
Tbody.displayName = "Tbody";

const Tr = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr className={cn(className)} ref={ref} {...props} />
));
Tr.displayName = "Tr";

const Th = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th className={cn(className)} ref={ref} {...props} />
));
Th.displayName = "Th";

const Td = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td className={cn(className)} ref={ref} {...props} />
));
Td.displayName = "Td";

export { Table, Thead, Tbody, Tr, Th, Td };

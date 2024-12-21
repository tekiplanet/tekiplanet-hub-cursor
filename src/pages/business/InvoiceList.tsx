<DataTableColumnHeader column={column} title="Amount">
  {formatCurrency(row.original.amount, row.original.currency || 'USD')}
</DataTableColumnHeader> 
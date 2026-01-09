// Export data to CSV

export function exportToCSV(data: any[], filename: string, columns?: string[]) {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers
  const headers = columns || Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Format data for export
export function prepareDataForExport(data: any[], mapping: Record<string, string | ((item: any) => any)>) {
  return data.map(item => {
    const row: Record<string, any> = {}
    
    Object.entries(mapping).forEach(([key, valueOrFn]) => {
      if (typeof valueOrFn === 'function') {
        row[key] = valueOrFn(item)
      } else {
        row[key] = item[valueOrFn]
      }
    })
    
    return row
  })
}

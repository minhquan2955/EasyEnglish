$files = @(
  'Attendance.jsx','ChildrenClasses.jsx','ChildrenGrades.jsx','ChildrenSchedule.jsx',
  'Class.jsx','Course.jsx','Dashboard.jsx','Enrollment.jsx','Login.jsx',
  'MyAttendance.jsx','MyGrades.jsx','MySchedule.jsx','MyTuition.jsx',
  'Parent.jsx','Profile.jsx','Schedule.jsx','Student.jsx','Teacher.jsx'
)

$replacements = [ordered]@{
  'rounded-[12px]' = 'rounded-xl'
  'rounded-[8px]'  = 'rounded-lg'
  'rounded-[6px]'  = 'rounded-md'
  'rounded-[4px]'  = 'rounded-sm'
  'bg-[#121314]'   = 'bg-surface-dark-elevated'
  'bg-[#0070d1]'   = 'bg-ps-blue'
  'hover:bg-[#0064b7]' = 'hover:bg-ps-blue-pressed'
  'active:bg-[#004d8d]' = 'active:bg-ps-blue-active'
  'text-[#0064b7]' = 'text-ps-blue-pressed'
  'flex-shrink-0'  = 'shrink-0'
  'max-w-[420px]'  = 'max-w-105'
  'max-w-[520px]'  = 'max-w-130'
  'h-[48px]'       = 'h-12'
  'h-[350px]'      = 'h-87.5'
  'h-[600px]'      = 'h-150'
  'w-[280px]'      = 'w-70'
  'w-[260px]'      = 'w-65'
  'w-[18px]'       = 'w-4.5'
  'min-w-[200px]'  = 'min-w-50'
  'min-w-[2rem]'   = 'min-w-8'
  'max-h-[300px]'  = 'max-h-75'
  'min-h-[400px]'  = 'min-h-100'
  'leading-[1.25]' = 'leading-tight'
  'leading-[1.5]'  = 'leading-normal'
  'focus:pl-[calc(2.75rem-1px)]' = 'focus:pl-10.75'
  'focus:pr-[calc(1rem-1px)]'    = 'focus:pr-3.75'
  'focus:pr-[calc(3rem-1px)]'    = 'focus:pr-11.75'
}

$totalChanges = 0
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($f in $files) {
  $path = Join-Path $dir $f
  if (-not (Test-Path $path)) {
    continue
  }
  $content = [System.IO.File]::ReadAllText($path)
  $original = $content
  $fileChanges = 0

  foreach ($key in $replacements.Keys) {
    if ($content.Contains($key)) {
      $count = ([regex]::Matches($content, [regex]::Escape($key))).Count
      $content = $content.Replace($key, $replacements[$key])
      $fileChanges += $count
    }
  }

  $fgPattern = '(?<=\s|"|'')flex-grow(?=\s|"|'')'
  if ($content -match $fgPattern) {
    $count = ([regex]::Matches($content, $fgPattern)).Count
    $content = [regex]::Replace($content, $fgPattern, 'grow')
    $fileChanges += $count
  }

  if ($content -ne $original) {
    [System.IO.File]::WriteAllText($path, $content)
    Write-Host "SAVED: $f ($fileChanges replacements)"
    $totalChanges += $fileChanges
  }
}

Write-Host "`nDone! Total replacements: $totalChanges"

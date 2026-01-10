$ErrorActionPreference = "Stop"
$mvnHome = "C:\Users\samue\.m2\wrapper\dists\apache-maven-3.9.11-bin\6mqf5t809d9geo83kj4ttckcbc\apache-maven-3.9.11"
$bootDir = "$mvnHome\boot"

Write-Host "Checking for plexus jar in $bootDir..."
$plexusJar = Get-ChildItem -Path $bootDir -Filter "plexus-classworlds-*.jar" | Select-Object -First 1

if (!$plexusJar) {
    Write-Error "Plexus jar not found in $bootDir"
    exit 1
}

Write-Host "Found Jar: $($plexusJar.FullName)"

# Use JAVA_HOME java if available
$javaCmd = "java"
if ($env:JAVA_HOME) {
    $javaCmd = "$env:JAVA_HOME\bin\java.exe"
}

Write-Host "Verifying Java: $javaCmd"
try {
    & "$javaCmd" -version 2>&1 | Write-Host
} catch {
    Write-Warning "Could not run java -version"
}

# Java Arguments
$javaArgs = @(
    "-Dclassworlds.conf=$mvnHome\bin\m2.conf",
    "-Dmaven.home=$mvnHome",
    "-Dmaven.multiModuleProjectDirectory=$PWD",
    "-classpath",
    $plexusJar.FullName,
    "org.codehaus.plexus.classworlds.launcher.Launcher",
    "spring-boot:run",
    "-DskipTests"
)

Write-Host "Executing Maven build..."
# Use Call Operator & for direct execution which handles spaces if quoted string provided
& "$javaCmd" $javaArgs

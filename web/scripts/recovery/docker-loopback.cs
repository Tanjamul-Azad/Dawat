// Windows-only scoped Docker CLI adapter. Never changes global Docker settings.
// Docker Desktop may ignore a bridge's default host-binding option. Explicit -p
// host addresses are applied before recovery containers are created, never after.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

class DawatDockerLoopback {
  static string Quote(string value) {
    // Windows CommandLineToArgvW escaping; no cmd.exe or shell interpretation.
    return "\"" + Regex.Replace(Regex.Replace(value, "(\\\\*)\"", "$1$1\\\""), "(\\\\+)$", "$1$1") + "\"";
  }
  static int Main(string[] args) {
    try {
      var real = Environment.GetEnvironmentVariable("DAWAT_DOCKER_REAL");
      if (String.IsNullOrEmpty(real) || !Path.IsPathRooted(real) || !File.Exists(real) ||
          String.Equals(Path.GetFullPath(real), Process.GetCurrentProcess().MainModule.FileName, StringComparison.OrdinalIgnoreCase)) return 70;
      var forwarded = new List<string>(args);
      if (args.Length > 0 && (args[0] == "create" || args[0] == "run")) {
        var nameAt = Array.IndexOf(args, "--name");
        bool recovery = nameAt >= 0 && nameAt + 1 < args.Length &&
          args[nameAt + 1].StartsWith("supabase_", StringComparison.Ordinal) &&
          args[nameAt + 1].EndsWith("_dawat-recovery", StringComparison.Ordinal);
        for (int i = 1; i < forwarded.Count; i++) {
          if (forwarded[i] != "-p" && forwarded[i] != "--publish") continue;
          if (!recovery || i + 1 >= forwarded.Count) return 71;
          var binding = forwarded[++i];
          if (!Regex.IsMatch(binding, "^553[0-9]{2}:[0-9]+(?:/tcp)?$")) return 72;
          forwarded[i] = "127.0.0.1:" + binding;
        }
      }
      var quoted = new List<string>();
      foreach (var arg in forwarded) quoted.Add(Quote(arg));
      var process = Process.Start(new ProcessStartInfo(real, String.Join(" ", quoted)) {
        UseShellExecute = false, CreateNoWindow = true,
        RedirectStandardInput = true, RedirectStandardOutput = true, RedirectStandardError = true
      });
      var output = Task.Factory.StartNew(() => process.StandardOutput.BaseStream.CopyTo(Console.OpenStandardOutput()));
      var errors = Task.Factory.StartNew(() => process.StandardError.BaseStream.CopyTo(Console.OpenStandardError()));
      Task.Factory.StartNew(() => {
        try { Console.OpenStandardInput().CopyTo(process.StandardInput.BaseStream); }
        catch (IOException) {} finally { try { process.StandardInput.Close(); } catch {} }
      });
      process.WaitForExit(); Task.WaitAll(output, errors); return process.ExitCode;
    } catch { Console.Error.WriteLine("Scoped recovery Docker adapter failed."); return 73; }
  }
}

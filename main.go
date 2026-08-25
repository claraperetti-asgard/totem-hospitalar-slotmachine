package main
 
import (
    "fmt"
    "log"
    "os"
    "os/exec"
    "runtime"
    "sync"
)
 
func main() {
    commandName := "npm"
 
    args := []string{"run", "dev"}
    //args2 := []string{"run", "server"}
 
    cmd := exec.Command(commandName, args...)
    // cmd2 := exec.Command(commandName, args2...)
 
    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr
    // cmd2.Stdout = os.Stdout
    // cmd2.Stderr = os.Stderr
 
    var wg sync.WaitGroup
    wg.Add(2)
 
    go func() {
        url := "http://localhost:5173/"
        var open *exec.Cmd
 
        switch runtime.GOOS {
        case "windows":
            open = exec.Command("cmd", "/c", "start", url) // No Windows, usa 'start'
        case "darwin": // macOS
            open = exec.Command("open", url) // No macOS, usa 'open'
        default: // Linux e outros
            open = exec.Command("xdg-open", url) // No Linux, usa 'xdg-open'
        }
 
        err := open.Run()
        if err != nil {
            fmt.Printf("Erro ao abrir o navegador: %v\n", err)
        }
        defer wg.Done()
        fmt.Printf("Executing command: %s %v\n", commandName, cmd.Args)
        if err := cmd.Start(); err != nil {
            log.Printf("dev start failed: %v\n", err)
            return
        }
        if err := cmd.Wait(); err != nil {
            log.Printf("dev exited with error: %v\n", err)
        } else {
            log.Printf("dev exited successfully\n")
        }
    }()
 
    // go func() {
    //     defer wg.Done()
    //     fmt.Printf("Executing command: %s %v\n", commandName, cmd2.Args)
    //     if err := cmd2.Start(); err != nil {
    //         log.Printf("server start failed: %v\n", err)
    //         return
    //     }
    //     if err := cmd2.Wait(); err != nil {
    //         log.Printf("server exited with error: %v\n", err)
    //     } else {
    //         log.Printf("server exited successfully\n")
    //     }
    // }()
 
    // Keep main process alive while both commands run
    wg.Wait()
}
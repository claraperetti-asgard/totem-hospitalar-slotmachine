package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

func main() {

	// Descobre a pasta atual
	currentDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	// Descobre onde está o executável
	exePath, err := os.Executable()
	if err != nil {
		log.Fatal(err)
	}

	exeDir := filepath.Dir(exePath)

	var launcherDir string

	if strings.Contains(exeDir, "go-build") {
		launcherDir = currentDir
	} else {
		launcherDir = exeDir
	}

	// O launcher está dentro da pasta principal do projeto
	projectDir := filepath.Dir(launcherDir)

	// Pastas do projeto
	backendDir := filepath.Join(projectDir, "api")
	frontendDir := projectDir

	fmt.Println("Projeto:", projectDir)
	fmt.Println("Backend:", backendDir)
	fmt.Println("Frontend:", frontendDir)
	fmt.Println()

	// Verifica se as pastas existem
	if _, err := os.Stat(backendDir); err != nil {
		log.Fatalf("Pasta do backend não encontrada: %s", backendDir)
	}

	if _, err := os.Stat(frontendDir); err != nil {
		log.Fatalf("Pasta do frontend não encontrada: %s", frontendDir)
	}

	backend := exec.Command("node", "server.js")
	backend.Dir = backendDir

	backend.Stdout = os.Stdout
	backend.Stderr = os.Stderr

	frontend := exec.Command("npm", "run", "dev")
	frontend.Dir = frontendDir

	frontend.Stdout = os.Stdout
	frontend.Stderr = os.Stderr

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()

		fmt.Println("Iniciando backend...")

		if err := backend.Start(); err != nil {
			log.Printf("Erro ao iniciar backend: %v\n", err)
			return
		}

		fmt.Println("Backend iniciado.")

		if err := backend.Wait(); err != nil {
			log.Printf("Backend encerrou: %v\n", err)
		}
	}()

	go func() {
		defer wg.Done()

		// Espera o backend começar
		time.Sleep(2 * time.Second)

		fmt.Println("Iniciando frontend...")

		if err := frontend.Start(); err != nil {
			log.Printf("Erro ao iniciar frontend: %v\n", err)
			return
		}

		fmt.Println("Frontend iniciado.")

		if err := frontend.Wait(); err != nil {
			log.Printf("Frontend encerrou: %v\n", err)
		}
	}()

	time.Sleep(4 * time.Second)

	url := "http://localhost:5173/"

	var open *exec.Cmd

	switch runtime.GOOS {

	case "windows":
		open = exec.Command("cmd", "/c", "start", "", url)

	case "darwin":
		open = exec.Command("open", url)

	default:
		open = exec.Command("xdg-open", url)
	}

	if err := open.Run(); err != nil {
		log.Printf("Erro ao abrir o navegador: %v\n", err)
	}

	// Mantém o launcher rodando enquanto
	// backend e frontend estiverem ativos
	wg.Wait()
}

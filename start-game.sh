#!/bin/bash

# LLM Sci-Fi Game Service Manager
# Bash script to start and stop frontend and backend services

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=5000
OLLAMA_PORT=11434

# Process names and commands
FRONTEND_PROCESS_NAME="node"
BACKEND_PROCESS_NAME="python"
FRONTEND_COMMAND="npm run dev"
BACKEND_COMMAND="python backend/app.py"

# Working directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Function to print colored status messages
print_status() {
    local message="$1"
    local color="$2"
    local timestamp=$(date '+%H:%M:%S')
    echo -e "[$timestamp] ${color}${message}${NC}"
}

# Function to check if a port is in use
check_port() {
    local port="$1"
    if command -v netstat >/dev/null 2>&1; then
        netstat -tuln 2>/dev/null | grep -q ":$port "
    elif command -v ss >/dev/null 2>&1; then
        ss -tuln 2>/dev/null | grep -q ":$port "
    elif command -v lsof >/dev/null 2>&1; then
        lsof -i :$port >/dev/null 2>&1
    else
        # Fallback: try to connect to the port
        timeout 1 bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null
    fi
}

# Function to get process using a port
get_process_by_port() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti :$port 2>/dev/null | head -1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tulnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | head -1
    elif command -v ss >/dev/null 2>&1; then
        ss -tulnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 | head -1
    fi
}

# Function to start frontend service
start_frontend() {
    print_status "Starting frontend service..." "$YELLOW"
    
    if check_port $FRONTEND_PORT; then
        print_status "Frontend port $FRONTEND_PORT is already in use!" "$RED"
        local pid=$(get_process_by_port $FRONTEND_PORT)
        if [ -n "$pid" ]; then
            print_status "Process using port: PID $pid" "$RED"
        fi
        return 1
    fi
    
    cd "$PROJECT_ROOT" || exit 1
    
    # Start frontend in background
    nohup npm run dev >/dev/null 2>&1 &
    local frontend_pid=$!
    
    # Wait a bit for the service to start
    sleep 3
    
    if check_port $FRONTEND_PORT; then
        print_status "Frontend started successfully on port $FRONTEND_PORT" "$GREEN"
        print_status "Frontend URL: http://localhost:$FRONTEND_PORT" "$CYAN"
        return 0
    else
        print_status "Failed to start frontend service" "$RED"
        return 1
    fi
}

# Function to start backend service
start_backend() {
    print_status "Starting backend service..." "$YELLOW"
    
    if check_port $BACKEND_PORT; then
        print_status "Backend port $BACKEND_PORT is already in use!" "$RED"
        local pid=$(get_process_by_port $BACKEND_PORT)
        if [ -n "$pid" ]; then
            print_status "Process using port: PID $pid" "$RED"
        fi
        return 1
    fi
    
    cd "$PROJECT_ROOT" || exit 1
    
    # Start backend in background
    nohup python backend/app.py >/dev/null 2>&1 &
    local backend_pid=$!
    
    # Wait a bit for the service to start
    sleep 3
    
    if check_port $BACKEND_PORT; then
        print_status "Backend started successfully on port $BACKEND_PORT" "$GREEN"
        print_status "Backend API: http://localhost:$BACKEND_PORT" "$CYAN"
        return 0
    else
        print_status "Failed to start backend service" "$RED"
        return 1
    fi
}

# Function to stop frontend service
stop_frontend() {
    print_status "Stopping frontend service..." "$YELLOW"
    
    local pid=$(get_process_by_port $FRONTEND_PORT)
    if [ -n "$pid" ]; then
        if kill -TERM "$pid" 2>/dev/null; then
            print_status "Frontend service stopped" "$GREEN"
            return 0
        else
            print_status "Error stopping frontend service" "$RED"
            return 1
        fi
    else
        print_status "Frontend service not running" "$YELLOW"
        return 0
    fi
}

# Function to stop backend service
stop_backend() {
    print_status "Stopping backend service..." "$YELLOW"
    
    local pid=$(get_process_by_port $BACKEND_PORT)
    if [ -n "$pid" ]; then
        if kill -TERM "$pid" 2>/dev/null; then
            print_status "Backend service stopped" "$GREEN"
            return 0
        else
            print_status "Error stopping backend service" "$RED"
            return 1
        fi
    else
        print_status "Backend service not running" "$YELLOW"
        return 0
    fi
}

# Function to show service status
show_status() {
    print_status "=== LLM Sci-Fi Game Service Status ===" "$CYAN"
    
    # Check Ollama
    if check_port $OLLAMA_PORT; then
        print_status "✓ Ollama is running on port $OLLAMA_PORT" "$GREEN"
    else
        print_status "✗ Ollama is not running on port $OLLAMA_PORT" "$RED"
        print_status "  Please start Ollama: ollama serve" "$YELLOW"
    fi
    
    # Check Backend
    if check_port $BACKEND_PORT; then
        local backend_pid=$(get_process_by_port $BACKEND_PORT)
        print_status "✓ Backend is running on port $BACKEND_PORT" "$GREEN"
        if [ -n "$backend_pid" ]; then
            print_status "  Process: PID $backend_pid" "$GRAY"
        fi
    else
        print_status "✗ Backend is not running on port $BACKEND_PORT" "$RED"
    fi
    
    # Check Frontend
    if check_port $FRONTEND_PORT; then
        local frontend_pid=$(get_process_by_port $FRONTEND_PORT)
        print_status "✓ Frontend is running on port $FRONTEND_PORT" "$GREEN"
        if [ -n "$frontend_pid" ]; then
            print_status "  Process: PID $frontend_pid" "$GRAY"
        fi
    else
        print_status "✗ Frontend is not running on port $FRONTEND_PORT" "$RED"
    fi
    
    print_status "=====================================" "$CYAN"
}

# Function to show logs
show_logs() {
    print_status "=== Recent Backend Logs ===" "$CYAN"
    
    local log_file="$PROJECT_ROOT/backend/logs/ollama_interactions.log"
    if [ -f "$log_file" ]; then
        tail -20 "$log_file"
    else
        print_status "No log file found at: $log_file" "$YELLOW"
    fi
    
    print_status "===========================" "$CYAN"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..." "$YELLOW"
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version 2>/dev/null)
        print_status "✓ Node.js: $node_version" "$GREEN"
    else
        print_status "✗ Node.js not found" "$RED"
        return 1
    fi
    
    # Check Python
    if command -v python >/dev/null 2>&1; then
        local python_version=$(python --version 2>&1)
        print_status "✓ Python: $python_version" "$GREEN"
    else
        print_status "✗ Python not found" "$RED"
        return 1
    fi
    
    # Check npm dependencies
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        print_status "✓ package.json found" "$GREEN"
    else
        print_status "✗ package.json not found" "$RED"
        return 1
    fi
    
    # Check backend requirements
    if [ -f "$PROJECT_ROOT/backend/requirements.txt" ]; then
        print_status "✓ requirements.txt found" "$GREEN"
    else
        print_status "✗ requirements.txt not found" "$RED"
        return 1
    fi
    
    return 0
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [start|stop|restart|status|logs]"
    echo ""
    echo "Commands:"
    echo "  start   - Start both frontend and backend services"
    echo "  stop    - Stop both frontend and backend services"
    echo "  restart - Restart both frontend and backend services"
    echo "  status  - Show status of all services"
    echo "  logs    - Show recent backend logs"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 stop"
    echo "  $0 status"
}

# Main execution
ACTION="${1:-start}"

print_status "LLM Sci-Fi Game Service Manager" "$CYAN"
print_status "Action: $ACTION" "$NC"

case "$ACTION" in
    "start")
        if ! check_prerequisites; then
            print_status "Prerequisites check failed. Please install missing dependencies." "$RED"
            exit 1
        fi
        
        print_status "Starting LLM Sci-Fi Game services..." "$YELLOW"
        
        if start_backend && start_frontend; then
            print_status "All services started successfully!" "$GREEN"
            print_status "Game URL: http://localhost:$FRONTEND_PORT" "$CYAN"
            print_status "API URL: http://localhost:$BACKEND_PORT" "$CYAN"
        else
            print_status "Some services failed to start. Check the output above." "$RED"
            exit 1
        fi
        ;;
    
    "stop")
        print_status "Stopping LLM Sci-Fi Game services..." "$YELLOW"
        
        if stop_frontend && stop_backend; then
            print_status "All services stopped successfully!" "$GREEN"
        else
            print_status "Some services failed to stop. Check the output above." "$RED"
            exit 1
        fi
        ;;
    
    "restart")
        print_status "Restarting LLM Sci-Fi Game services..." "$YELLOW"
        
        stop_frontend
        stop_backend
        sleep 2
        
        if start_backend && start_frontend; then
            print_status "All services restarted successfully!" "$GREEN"
            print_status "Game URL: http://localhost:$FRONTEND_PORT" "$CYAN"
            print_status "API URL: http://localhost:$BACKEND_PORT" "$CYAN"
        else
            print_status "Some services failed to restart. Check the output above." "$RED"
            exit 1
        fi
        ;;
    
    "status")
        show_status
        ;;
    
    "logs")
        show_logs
        ;;
    
    "help"|"-h"|"--help")
        show_usage
        ;;
    
    *)
        print_status "Unknown action: $ACTION" "$RED"
        show_usage
        exit 1
        ;;
esac

print_status "Service manager completed." "$CYAN" 
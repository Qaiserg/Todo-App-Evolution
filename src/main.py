"""Main entry point for the todo application."""

from src.repository import TaskRepository
from src.service import TaskService
from src.cli import TodoCLI, console


def main() -> None:
    """Initialize and run the todo application.

    This function:
    1. Creates the repository (in-memory storage)
    2. Creates the service (business logic)
    3. Creates the CLI (user interface)
    4. Runs the interactive command loop
    """
    # Initialize layers (dependency injection)
    repository = TaskRepository()
    service = TaskService(repository)
    cli = TodoCLI(service)

    # Show welcome message once
    cli.show_welcome()

    # Show menu once at the top
    cli.show_menu()

    # Interactive command loop
    while True:
        try:
            # Get user input with prompt (menu stays at top)
            console.print("[dim]Choose an option (1-7) or type a command:[/dim]")
            command = console.input("[bold cyan]>[/bold cyan] ").strip()

            if not command:
                continue

            # Handle number-based menu
            if command in ["1", "2", "3", "4", "5", "6", "7"]:
                if command == "1":  # Add Task
                    title = console.input("[cyan]Task title:[/cyan] ").strip()
                    if title:
                        description = console.input("[cyan]Description (optional, press Enter to skip):[/cyan] ").strip()
                        cli.add_task(title, description if description else None)
                    else:
                        console.print("[red]Title cannot be empty![/red]\n")

                elif command == "2":  # View Tasks
                    filter_text = console.input("[cyan]Filter (all/pending/completed, press Enter for all):[/cyan] ").strip()
                    cli.view_tasks(filter_text if filter_text else None)

                elif command == "3":  # Update Task
                    task_id = console.input("[cyan]Task ID:[/cyan] ").strip()
                    field = console.input("[cyan]Field (title/description/status):[/cyan] ").strip()
                    value = console.input("[cyan]New value:[/cyan] ").strip()
                    if task_id and field and value:
                        cli.update_task(task_id, field, value)
                    else:
                        console.print("[red]All fields are required![/red]\n")

                elif command == "4":  # Mark Complete
                    task_id = console.input("[cyan]Task ID to mark complete:[/cyan] ").strip()
                    if task_id:
                        cli.mark_complete(task_id)
                    else:
                        console.print("[red]Task ID is required![/red]\n")

                elif command == "5":  # Delete Task
                    task_id = console.input("[cyan]Task ID to delete:[/cyan] ").strip()
                    if task_id:
                        cli.delete_task(task_id)
                    else:
                        console.print("[red]Task ID is required![/red]\n")

                elif command == "6":  # Help
                    cli.show_help()

                elif command == "7":  # Exit
                    console.print("\n[yellow]Goodbye! 👋[/yellow]\n")
                    break

                continue

            # Parse command
            parts = command.split(maxsplit=3)
            cmd = parts[0].lower()

            # Handle text commands
            if cmd == "exit" or cmd == "quit":
                console.print("\n[yellow]Goodbye! 👋[/yellow]\n")
                break

            elif cmd == "help":
                cli.show_help()

            elif cmd == "add":
                if len(parts) < 2:
                    console.print("[red]Error: 'add' requires a title[/red]")
                    console.print("[dim]Usage: add <title> [description][/dim]\n")
                else:
                    title = parts[1]
                    description = parts[2] if len(parts) > 2 else None
                    cli.add_task(title, description)

            elif cmd == "delete":
                if len(parts) < 2:
                    console.print("[red]Error: 'delete' requires a task ID[/red]")
                    console.print("[dim]Usage: delete <id>[/dim]\n")
                else:
                    cli.delete_task(parts[1])

            elif cmd == "update":
                if len(parts) < 4:
                    console.print("[red]Error: 'update' requires task ID, field, and value[/red]")
                    console.print("[dim]Usage: update <id> <field> <value>[/dim]")
                    console.print("[dim]Fields: title, description, status[/dim]\n")
                else:
                    cli.update_task(parts[1], parts[2], parts[3])

            elif cmd == "view":
                # Handle: view, view all, view pending, view completed
                status_filter = parts[1] if len(parts) > 1 else None
                cli.view_tasks(status_filter)

            elif cmd == "complete":
                if len(parts) < 2:
                    console.print("[red]Error: 'complete' requires a task ID[/red]")
                    console.print("[dim]Usage: complete <id>[/dim]\n")
                else:
                    cli.mark_complete(parts[1])

            else:
                console.print(f"[red]Unknown command:[/red] {cmd}")
                console.print("[dim]Type 'help' for available commands[/dim]\n")

        except KeyboardInterrupt:
            console.print("\n\n[yellow]Interrupted. Type 'exit' to quit.[/yellow]\n")
        except Exception as e:
            console.print(f"\n[red]An error occurred:[/red] {str(e)}\n")


if __name__ == "__main__":
    main()

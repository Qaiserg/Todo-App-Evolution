"""CLI interface using Rich for beautiful terminal output."""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from src.service import TaskService
from src.models import TaskStatus


console = Console()


class TodoCLI:
    """Command-line interface for the todo application.

    Uses Rich library for colorful and formatted terminal output.

    Attributes:
        service: TaskService instance for business logic
    """

    def __init__(self, service: TaskService) -> None:
        """Initialize the CLI.

        Args:
            service: TaskService instance to use for operations
        """
        self.service = service

    def add_task(self, title: str, description: str | None = None) -> None:
        """Add a new task via CLI.

        Args:
            title: Task title
            description: Optional task description
        """
        result = self.service.add_task(title=title, description=description)

        if result["success"]:
            # Display success message
            console.print(f"\n[green]✓[/green] {result['message']}\n")

            # Display task details
            task = result["task"]
            self._display_task_details(task)
        else:
            # Display error message
            console.print(f"\n[red]✗ Error:[/red] {result['error']}\n", style="bold red")

    def _display_task_details(self, task) -> None:
        """Display formatted task details.

        Args:
            task: Task object to display
        """
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Field", style="cyan")
        table.add_column("Value", style="white")

        table.add_row("ID", str(task.id))
        table.add_row("Title", task.title)
        if task.description:
            table.add_row("Description", task.description)
        table.add_row("Status", "Pending" if task.status == TaskStatus.PENDING else "Completed")
        table.add_row("Created", task.created_at.strftime("%Y-%m-%d %H:%M:%S"))

        console.print(table)

    def delete_task(self, task_id_str: str) -> None:
        """Delete a task via CLI.

        Args:
            task_id_str: Task ID as string (will be converted to int)
        """
        try:
            # Convert string to integer
            task_id = int(task_id_str)
        except ValueError:
            console.print("\n[red]✗ Error:[/red] Invalid task ID. Please provide a valid number.\n", style="bold red")
            return

        # Call service to delete task
        result = self.service.delete_task(task_id)

        if result["success"]:
            # Display success message
            console.print(f"\n[green]✓[/green] {result['message']}\n")
        else:
            # Display error message
            console.print(f"\n[red]✗ Error:[/red] {result['error']}\n", style="bold red")

    def update_task(self, task_id_str: str, field: str, value: str) -> None:
        """Update a task via CLI.

        Args:
            task_id_str: Task ID as string (will be converted to int)
            field: Field to update (title, description, status)
            value: New value for the field
        """
        try:
            # Convert string to integer
            task_id = int(task_id_str)
        except ValueError:
            console.print("\n[red]✗ Error:[/red] Invalid task ID. Please provide a valid number.\n", style="bold red")
            return

        # Validate field
        field = field.lower()
        if field not in ["title", "description", "status"]:
            console.print("\n[red]✗ Error:[/red] Invalid field. Must be 'title', 'description', or 'status'.\n", style="bold red")
            console.print("[dim]Usage: update <id> <field> <value>[/dim]\n")
            return

        # Prepare update parameters
        update_params = {"task_id": task_id}

        if field == "title":
            update_params["title"] = value
        elif field == "description":
            # Allow "none" or "null" to clear description
            if value.lower() in ["none", "null"]:
                update_params["description"] = None
            else:
                update_params["description"] = value
        elif field == "status":
            # Convert string to TaskStatus
            value_lower = value.lower()
            if value_lower == "pending":
                update_params["status"] = TaskStatus.PENDING
            elif value_lower == "completed":
                update_params["status"] = TaskStatus.COMPLETED
            else:
                console.print("\n[red]✗ Error:[/red] Invalid status. Must be 'pending' or 'completed'.\n", style="bold red")
                return

        # Call service to update task
        result = self.service.update_task(**update_params)

        if result["success"]:
            # Display success message
            console.print(f"\n[green]✓[/green] {result['message']}\n")

            # Display task details
            task = result["task"]
            self._display_task_details(task)
        else:
            # Display error message
            console.print(f"\n[red]✗ Error:[/red] {result['error']}\n", style="bold red")

    def view_tasks(self, status_filter: str | None = None) -> None:
        """View tasks via CLI with optional status filter.

        Args:
            status_filter: Optional filter ('pending', 'completed', 'all', or None)
        """
        # Convert filter string to TaskStatus
        status = None
        if status_filter:
            filter_lower = status_filter.lower()
            if filter_lower == "pending":
                status = TaskStatus.PENDING
            elif filter_lower == "completed":
                status = TaskStatus.COMPLETED
            elif filter_lower == "all":
                status = None
            else:
                console.print(f"\n[red]✗ Error:[/red] Invalid filter '{status_filter}'. Use 'all', 'pending', or 'completed'.\n", style="bold red")
                return

        # Call service to get tasks
        result = self.service.view_tasks(status=status)

        tasks = result["tasks"]

        # Handle empty list
        if len(tasks) == 0:
            if status_filter == "pending":
                console.print("\n[yellow]No pending tasks found. Great job![/yellow]\n")
            elif status_filter == "completed":
                console.print("\n[yellow]No completed tasks found. Keep working![/yellow]\n")
            else:
                console.print("\n[yellow]No tasks found. Add your first task with 'add <title>'.[/yellow]\n")
            return

        # Display task count
        count_msg = f"Showing {len(tasks)} "
        if status_filter == "pending":
            count_msg += "pending task" if len(tasks) == 1 else "pending tasks"
        elif status_filter == "completed":
            count_msg += "completed task" if len(tasks) == 1 else "completed tasks"
        else:
            count_msg += "task" if len(tasks) == 1 else "tasks"

        console.print(f"\n[cyan]{count_msg}[/cyan]\n")

        # Create Rich table
        table = Table(show_header=True, header_style="bold cyan", border_style="cyan")
        table.add_column("ID", style="white", width=6)
        table.add_column("Title", style="white", width=25)
        table.add_column("Description", style="dim", width=20)
        table.add_column("Status", width=10)
        table.add_column("Created", style="dim", width=19)
        table.add_column("Updated", style="dim", width=19)

        # Add rows
        for task in tasks:
            # Format description
            desc = task.description if task.description else "—"
            if len(desc) > 20:
                desc = desc[:17] + "..."

            # Format status with color
            if task.status == TaskStatus.PENDING:
                status_str = "[yellow]Pending[/yellow]"
            else:
                status_str = "[green]Completed[/green]"

            # Format timestamps
            created = task.created_at.strftime("%Y-%m-%d %H:%M:%S")
            updated = task.updated_at.strftime("%Y-%m-%d %H:%M:%S")

            table.add_row(
                str(task.id),
                task.title[:22] + "..." if len(task.title) > 25 else task.title,
                desc,
                status_str,
                created,
                updated
            )

        console.print(table)
        console.print()

    def mark_complete(self, task_id_str: str) -> None:
        """Mark a task as complete via CLI.

        Args:
            task_id_str: Task ID as string (will be converted to int)
        """
        try:
            # Convert string to integer
            task_id = int(task_id_str)
        except ValueError:
            console.print("\n[red]✗ Error:[/red] Invalid task ID. Please provide a valid number.\n", style="bold red")
            return

        # Call service to mark task complete
        result = self.service.mark_complete(task_id)

        if result["success"]:
            # Display success message
            console.print(f"\n[green]✓[/green] {result['message']}\n")
        else:
            # Display error message
            console.print(f"\n[red]✗ Error:[/red] {result['error']}\n", style="bold red")

    def show_welcome(self) -> None:
        """Display welcome message on startup."""
        console.print("\n[bold cyan]✨ Welcome to Todo App - Phase 1 ✨[/bold cyan]\n")

    def show_help(self) -> None:
        """Display help information."""
        help_text = """
[bold yellow]Quick Commands:[/bold yellow]
  • [white]add[/white] <title> [description]       - Add a new task
  • [white]view[/white] [all|pending|completed]    - View tasks
  • [white]update[/white] <id> <field> <value>     - Update a task
  • [white]complete[/white] <id>                   - Mark as complete
  • [white]delete[/white] <id>                     - Delete a task
  • [white]exit[/white]                            - Exit the app

[dim]💡 Or just use the menu by pressing 1-7![/dim]
        """
        console.print(Panel(
            help_text,
            title="[bold cyan]❓ Help[/bold cyan]",
            border_style="yellow",
            padding=(1, 2)
        ))

    def show_menu(self) -> None:
        """Display interactive menu."""
        menu = """[bold white]1.[/bold white] ➕ Add Task        [bold white]2.[/bold white] 📝 View Tasks       [bold white]3.[/bold white] ✏️  Update Task
[bold white]4.[/bold white] ✅ Mark Complete   [bold white]5.[/bold white] 🗑️  Delete Task      [bold white]6.[/bold white] ❓ Help
[bold white]7.[/bold white] 🚪 Exit"""
        console.print(Panel(
            menu,
            title="[bold cyan]📋 Todo App[/bold cyan]",
            border_style="cyan",
            padding=(0, 2)
        ))
        console.print()

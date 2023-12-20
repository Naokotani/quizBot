const help = (command) => {
	let helpString
	switch (command) {
		case 'show':
			helpString = `
Show takes two optional arguments \`type\` and \`class\`. Type refers to the
type of task and is restricted to 'Assignment' and 'Quiz'. These arguments
will filter the reponses based on your selection. After Quizbot lists the tasks
a 'remove' button will appear. This will create message with a dropdown where
you can select which task you would like to remove.
`
			break;
		case 'task':
			helpString = `
The task command takes several arguments to create a new task. These arguments
are all required for a task to be created. After entering this informaton, a
modal will open. The only field in the modal that is required is the name of
the task. The time can be changed from the default and additional information can
entereted about the task. It is important that the time follow the format
'11:59am' or '11:59AM'.
`
			break;
		case 'class':
			helpString = `
The class command takes one of four required subcommands.

__add:__
Add adds a new class. The only required argument is to enter a name. The status
of the class is automatically set to active.

__show:__
Show lists all classes and displays the class ids and whether they are active or inactive.
Tasks that are inactive will be hidden.

__status:__
Status toggles the status of a class between active and inactive. It takes one
argument \`id\`. To find the appropriate id use \`/class show\`.

__remove:__
Remove takes one argument, which is the class id.
 **This will remove the class AND all of its associated tasks.**
`
			break;
		case 'next':
			helpString = `
The next command takes three optional aruments. \`limit\` sets the number of tasks
to display, \`type\` and \`class\` filter the results. The results will display
the upcoming tasks only. To see all tasks, use the \`/show\` command.
`
			break;
		case 'overview':
			helpString = `
Quizbot is a simple Discord bot designed to track and list tasks, such as
quizes and assignments based on classes. It is not designed as a general
purpose task tracker. For more information about other commands, select a
command from the dropdown below.
`
			break;
		default:
			helpString = "Unable to find help info"
	}
	return helpString;
}

exports.help = help;

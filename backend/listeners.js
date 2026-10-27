const taskEvents = require('./events');

// EventEmitter invokes listeners synchronously, so keep slow work inside
// an asynchronous callback to avoid delaying the request handler.
taskEvents.on('task-created', (payload) => {
  const startedAt = new Date().toISOString();
  console.log(`[Notification] Handler started at ${startedAt}`);

  setTimeout(() => {
    try {
      // Demonstration of a background notification taking 2 seconds.
      console.log(
        `[Notification] Task "${payload.task.title}" created at ${new Date().toISOString()}; ` +
        `assigned user: ${payload.assignedUser}`
      );
      console.log(`[Notification] Handler finished at ${new Date().toISOString()}`);
    } catch (error) {
      taskEvents.emit('error', error, payload);
    }
  }, 2000);
});

taskEvents.on('task-deleted', (task) => {
  console.log(
    `[Task Deleted] "${task.title}" deleted at ${new Date().toISOString()}`
  );
});

// EventEmitter's special "error" event must always have a listener.
taskEvents.on('error', (error, payload) => {
  console.error(
    `[Notification Error] at ${new Date().toISOString()}:`,
    error.message,
    payload?.task?.title ? `(task: ${payload.task.title})` : ''
  );
});

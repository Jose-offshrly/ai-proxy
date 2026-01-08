// Voice Agent Tools - Auto-extracted from sources/js/voice_agent_tools.js
// Generated: 2026-01-02T16:06:11.920Z
// DO NOT EDIT - This is the source of truth for Lambda

export const VOICE_AGENT_TOOLS = [
  {
    "type": "function",
    "name": "end_session",
    "description": "End the current voice session. Call this when the user says they are done, wants to stop, says goodbye, or the conversation has reached a natural conclusion.\n\nSAVING BEHAVIOR:\n- If user says \"save\", \"save it\", \"end and save\" → set should_save: true\n- If user says \"don't save\", \"no save\", \"just end\", \"discard\" → set should_save: false\n- If user doesn't specify (just \"I'm done\", \"goodbye\", \"end session\") → omit should_save to show confirmation dialog\n\nCommon triggers: \"I'm done\", \"that's all\", \"goodbye\", \"end session\", \"stop\", \"thanks, that's it\".",
    "parameters": {
      "type": "object",
      "properties": {
        "summary": {
          "type": "string",
          "description": "A brief 1-2 sentence summary of what was discussed and any actions taken"
        },
        "should_save": {
          "type": "boolean",
          "description": "Whether to save the session transcript as a note. true = save, false = discard. Omit this parameter to show user a confirmation dialog asking whether to save."
        }
      },
      "required": [
        "summary"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_task",
    "description": "Create a NEW standalone task for the user. Tasks can be in the Inbox or belong to a Task List.\n\n⚠️ IMPORTANT: If the user wants to create a task FROM A MEETING ACTIONABLE (action item from meeting analysis), you MUST use send_actionable_to_task instead! That tool links the task to the actionable. Use this create_task tool ONLY for brand new tasks unrelated to meeting actionables.\n\nWORKFLOW FOR STANDALONE TASKS:\n1. Use lookup_task_lists FIRST to see available lists\n2. If user mentions a category/project, match to existing list or ASK which list\n3. If assigning to someone, use lookup_pulse_members FIRST to get their user ID\n4. Tasks can ONLY be assigned to current pulse/team members\n\nBe proactive about organization - suggest lists when appropriate.",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "The task title - should be clear, actionable, and concise (e.g., \"Follow up with John about proposal\")"
        },
        "description": {
          "type": "string",
          "description": "Optional additional details, context, or notes about the task"
        },
        "due_date": {
          "type": "string",
          "description": "Due date in YYYY-MM-DD format. Infer from context like \"tomorrow\", \"next week\", \"Friday\", \"end of month\". If unclear, ask the user."
        },
        "priority": {
          "type": "string",
          "enum": [
            "LOW",
            "MEDIUM",
            "HIGH"
          ],
          "description": "Task priority. Infer from urgency words like \"urgent\", \"ASAP\", \"when you get a chance\". Default to MEDIUM if not specified."
        },
        "list_name": {
          "type": "string",
          "description": "Name of the task list to add this task to (must match an existing list name from lookup_task_lists). If not specified, task goes to Inbox. ALWAYS use lookup_task_lists first to see available lists."
        },
        "assignee_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of user IDs to assign the task to. Use \"self\" to assign to the current user. For other people, use person_N refs or user IDs from lookup_pulse_members. Tasks can ONLY be assigned to people in the current pulse/team."
        }
      },
      "required": [
        "title"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_task_lists",
    "description": "Get the user's task lists. Use this when they ask about their lists, want to see how tasks are organized, before creating a task in a specific list, or before sending actionables to tasks.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The pulse/team ID to get task lists for. If not provided, uses the current pulse. Use this when sending actionables to a different team's task list."
        },
        "include_task_counts": {
          "type": "boolean",
          "description": "If true, include count of tasks in each list. Default true."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "create_task_list",
    "description": "Create a new task list to organize tasks. Use when the user wants to create a new list/category for their tasks, like \"Work Projects\" or \"Personal\".",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "The name of the task list - descriptive and clear"
        },
        "description": {
          "type": "string",
          "description": "Optional description of what this list is for"
        }
      },
      "required": [
        "title"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_tasks",
    "description": "Search and retrieve the user's tasks. Use this when they ask about their tasks, to-do list, what they need to do, or want to review their work. Also use this before marking a task complete if you need to find the task ID.",
    "parameters": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "TODO",
            "INPROGRESS",
            "COMPLETED",
            "OVERDUE",
            "ALL"
          ],
          "description": "Filter by task status. Use TODO for active/open tasks (default), INPROGRESS for in-progress, COMPLETED for done tasks, ALL for everything."
        },
        "priority": {
          "type": "string",
          "enum": [
            "LOW",
            "MEDIUM",
            "HIGH"
          ],
          "description": "Filter by priority level. Only use if user specifically asks for high priority tasks, etc."
        },
        "list_name": {
          "type": "string",
          "description": "Filter by task list name. Use when user asks for tasks \"in [list name]\" or \"from [list name] list\". This filters tasks that belong to a specific task list/folder."
        },
        "search_query": {
          "type": "string",
          "description": "Search text to filter tasks by title or description. Use when user asks about a specific task by name."
        },
        "include_overdue": {
          "type": "boolean",
          "description": "If true, specifically highlight overdue tasks. Use when user asks \"what's overdue?\" or \"what did I miss?\""
        },
        "limit": {
          "type": "number",
          "description": "Maximum number of tasks to return. Default is 10. Use smaller numbers for quick summaries."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "get_task_details",
    "description": "Get full details about a specific task including description, assignees, subtasks, and list assignment. Use when user asks about details of a particular task, who is assigned, or wants more information. Use lookup_tasks first if you need to find the task_id.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "The ID of the task to get details for. Required."
        }
      },
      "required": [
        "task_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_task",
    "description": "Display a task in a visual modal popup so the user can see all details on screen. Use when the user says \"show me that task\", \"let me see it\", \"display it\", or wants to visually review a task. The modal shows task title, description, assignees, priority, due date, and list. User can close the modal to continue the conversation, or navigate to the full task page (which will end the voice session).",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "The ref (e.g., \"task_1\") or exact ID of the task to display. Use lookup_tasks first if needed. Prefer using refs."
        }
      },
      "required": [
        "task_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "complete_task",
    "description": "Mark a task as completed. Use when the user says they finished something, completed a task, or want to check something off. If you don't know the task ID, first use lookup_tasks to find it by title.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "The ID of the task to complete. Get this from lookup_tasks if not known."
        },
        "task_title": {
          "type": "string",
          "description": "The title of the task to find and complete. Use this if task_id is not known - will search for matching task."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "update_task",
    "description": "Update an existing task's details. Can change title, description, due date, priority, status, assignees, or move to a different task list.\n\nIMPORTANT: When changing assignees, use lookup_pulse_members FIRST to get valid user IDs. Tasks can ONLY be assigned to people in the current pulse/team.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "The ID of the task to update (required)"
        },
        "title": {
          "type": "string",
          "description": "New title for the task"
        },
        "description": {
          "type": "string",
          "description": "New or updated description"
        },
        "due_date": {
          "type": "string",
          "description": "New due date in YYYY-MM-DD format"
        },
        "priority": {
          "type": "string",
          "enum": [
            "LOW",
            "MEDIUM",
            "HIGH"
          ],
          "description": "New priority level"
        },
        "status": {
          "type": "string",
          "enum": [
            "TODO",
            "INPROGRESS",
            "COMPLETED"
          ],
          "description": "New status. Use TODO for open, INPROGRESS for in-progress, COMPLETED for done."
        },
        "task_list_id": {
          "type": "string",
          "description": "ID of the task list to move this task into. Use this to move a task to a different list. Get the list ID from lookup_task_lists first."
        },
        "assignee_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of user IDs to assign the task to. REPLACES all existing assignees. Use \"self\" to assign to the current user. For other people, use person_N refs or user IDs from lookup_pulse_members."
        }
      },
      "required": [
        "task_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_task",
    "description": "Permanently delete a task. Use when user explicitly says \"delete this task\", \"remove that task\", \"get rid of it\". This action CANNOT be undone. Requires confirmation.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "string",
          "description": "The ID of the task to delete. Required. Use lookup_tasks first if needed."
        }
      },
      "required": [
        "task_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_task_list",
    "description": "Permanently delete a task list. WARNING: This will also delete ALL tasks in the list. Use only when user explicitly wants to remove an entire list. Requires confirmation.",
    "parameters": {
      "type": "object",
      "properties": {
        "list_id": {
          "type": "string",
          "description": "The ID of the task list to delete. Required. Use lookup_task_lists first to find the ID."
        }
      },
      "required": [
        "list_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_tasks",
    "description": "Display multiple tasks in a visual list modal so the user can see them on screen. Use when the user says \"show me my tasks\", \"let me see them\", \"display the list\", or wants to visually review multiple tasks at once. Much more efficient than describing tasks one by one. User can tap a task to see details, or close to continue conversation.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of task IDs to display. Get these from lookup_tasks first."
        },
        "title": {
          "type": "string",
          "description": "Optional title for the list modal, e.g. \"High Priority Tasks\" or \"Tasks Due Today\""
        }
      },
      "required": [
        "task_ids"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_note",
    "description": "Create a note to capture information, ideas, or anything the user wants to remember. Use when they want to jot something down, save an idea, or explicitly ask to create a note.",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Note title - descriptive and searchable"
        },
        "content": {
          "type": "string",
          "description": "Note content - can be detailed, include the full context discussed"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Tags/labels for categorization (e.g., [\"meeting-notes\", \"project-x\"])"
        },
        "pinned": {
          "type": "boolean",
          "description": "Whether to pin the note for quick access. Default false."
        }
      },
      "required": [
        "title",
        "content"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_notes",
    "description": "Search for notes. Use when the user asks about something they wrote down, a previous note, or wants to find information they saved. Returns note previews - use get_note_details or show_note for full content.",
    "parameters": {
      "type": "object",
      "properties": {
        "search_query": {
          "type": "string",
          "description": "Text to search for in note titles and content"
        },
        "pinned_only": {
          "type": "boolean",
          "description": "If true, only return pinned notes"
        },
        "limit": {
          "type": "number",
          "description": "Maximum notes to return. Default is 5."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "get_note_details",
    "description": "Get full details of a specific note including complete content. Use when user wants to know what a note says, read its content, or get more details about a note found via lookup_notes.",
    "parameters": {
      "type": "object",
      "properties": {
        "note_id": {
          "type": "string",
          "description": "The ID of the note to retrieve"
        }
      },
      "required": [
        "note_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_note",
    "description": "Display a note in a visual modal so the user can read it on screen. Use when user says \"show me that note\", \"let me see it\", \"display it\". Shows full title and content. User can close to continue, or navigate to full note page.",
    "parameters": {
      "type": "object",
      "properties": {
        "note_id": {
          "type": "string",
          "description": "The ref (e.g., \"note_1\") or exact ID of the note to display. Prefer using refs from lookup_notes."
        }
      },
      "required": [
        "note_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_notes",
    "description": "Display multiple notes in a list modal for the user to browse. Use when showing search results visually, or when user wants to see several notes at once. User can tap a note to see full details.",
    "parameters": {
      "type": "object",
      "properties": {
        "note_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of note refs or IDs to display (e.g., [\"note_1\", \"note_2\"])"
        },
        "title": {
          "type": "string",
          "description": "Title for the list modal (e.g., \"Search Results\", \"Pinned Notes\")"
        }
      },
      "required": [
        "note_ids"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_note",
    "description": "Edit an existing note - change its title, content, or labels/tags. Use when user says \"change that note\", \"update the title\", \"add to that note\", \"edit\", \"tag this\", \"add labels\". Requires confirmation.",
    "parameters": {
      "type": "object",
      "properties": {
        "note_id": {
          "type": "string",
          "description": "The ID of the note to update"
        },
        "title": {
          "type": "string",
          "description": "New title (if changing)"
        },
        "content": {
          "type": "string",
          "description": "New content (if changing) - replaces entire content"
        },
        "append_content": {
          "type": "string",
          "description": "Content to append to existing content (alternative to replacing)"
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Labels/tags to set on the note (replaces existing labels). Use lowercase strings like \"work\", \"personal\", \"urgent\""
        }
      },
      "required": [
        "note_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "pin_note",
    "description": "Pin a note so it appears at the top of the notes list for quick access. Use when user says \"pin this note\", \"keep this handy\", \"favorite this\".",
    "parameters": {
      "type": "object",
      "properties": {
        "note_id": {
          "type": "string",
          "description": "The ID of the note to pin"
        }
      },
      "required": [
        "note_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "unpin_note",
    "description": "Unpin a note. Use when user says \"unpin this\", \"remove from pinned\".",
    "parameters": {
      "type": "object",
      "properties": {
        "note_id": {
          "type": "string",
          "description": "The ID of the note to unpin"
        }
      },
      "required": [
        "note_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_note",
    "description": "Permanently delete a note. This is destructive and requires confirmation. Use when user explicitly says \"delete this note\", \"remove it\", \"get rid of it\".",
    "parameters": {
      "type": "object",
      "properties": {
        "note_id": {
          "type": "string",
          "description": "The ID of the note to delete"
        }
      },
      "required": [
        "note_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_note_view",
    "description": "Close the note view modal. Call when user says \"close\", \"dismiss\", \"okay\", \"got it\" while viewing a note.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_notes_list",
    "description": "Close the notes list modal. Call when user says \"close\", \"dismiss\" while viewing a list of notes.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "lookup_events",
    "description": "Search calendar events and meetings. Use when the user asks about their schedule, what meetings they have, or what's coming up. Returns a list of events with basic info.\n\nIMPORTANT: After getting events from this function:\n- For PAST events (dates before today): use show_past_event to display them\n- For UPCOMING events (dates today or future): use show_event to display them\n\nThe response includes pagination info. If has_more_pages is true, you can call again with a higher page number to get more events.\n\nThe event_id returned here can be used with EITHER show function depending on the event's date.\n\nATTENDEE SEARCH: You can search by attendee name (e.g., \"Ricky\", \"John\"). The search checks both event titles AND attendee names. Results include an \"attendees\" field with participant names for easy reference.",
    "parameters": {
      "type": "object",
      "properties": {
        "date_from": {
          "type": "string",
          "description": "Start date in YYYY-MM-DD format. Default is today."
        },
        "date_to": {
          "type": "string",
          "description": "End date in YYYY-MM-DD format. Default is 7 days from now."
        },
        "search_query": {
          "type": "string",
          "description": "Filter events by name/title OR attendee name. Searches both event titles and participant names."
        },
        "timeframe": {
          "type": "string",
          "enum": [
            "upcoming",
            "past",
            "today",
            "tomorrow",
            "this_week",
            "next_week"
          ],
          "description": "Quick filter for common timeframes. Overrides date_from/date_to if provided."
        },
        "has_recording": {
          "type": "boolean",
          "description": "Filter to only events with meeting recordings/transcripts"
        },
        "limit": {
          "type": "number",
          "description": "Maximum events per page. Default is 20 for date range/timeframe queries."
        },
        "page": {
          "type": "number",
          "description": "Page number for pagination (1-based). Use when has_more_pages was true in previous response."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_event_details",
    "description": "Get full details for a specific event including attendees, agenda items, talking points, meeting link, importance, and description. Use when user asks about a specific meeting.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the event (used to search if ID not known)"
        },
        "date_hint": {
          "type": "string",
          "description": "Approximate date of the event to help narrow search (YYYY-MM-DD)"
        }
      }
    }
  },
  {
    "type": "function",
    "name": "show_event",
    "description": "Display an upcoming or current event in a visual modal showing all details. Use when user says \"show me\", \"let me see\", \"display\", or wants to visually review an event.\n\nIMPORTANT: Use the ref (e.g., \"event_1\", \"event_2\") or exact event_id from a previous lookup_events or lookup_event_details call. Refs are preferred as they are simpler and guaranteed to work within this session. Do NOT make up or guess IDs.\n\nNote: This is for UPCOMING/CURRENT events. For past events with recordings, use show_past_event instead.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the event from lookup_events. Prefer using the ref."
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_events",
    "description": "Display multiple events in a list modal. Use when user wants to see several events or browse their schedule visually.\n\n⚠️ CRITICAL: Event refs are DATE-SCOPED. You MUST call lookup_events or lookup_past_events FIRST to get valid refs for the date range the user is asking about.\n- If showing TODAY's events, call lookup_events(timeframe: \"today\") first\n- If showing PAST events, call lookup_past_events with the correct date range first\n- DO NOT reuse refs from a previous lookup for a different date - they will not display correctly\n- If this function shows fewer events than expected, the refs are stale - make a new lookup query\n\nPAGINATION: If there are more events than displayed, pass pagination info from the lookup response. The modal will show \"Page X of Y\" and voice navigation hints.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of event refs from a RECENT lookup for the correct date range (e.g., [\"event_1\", \"event_2\"]). Must be from lookup_events or lookup_past_events for the date you want to show."
        },
        "title": {
          "type": "string",
          "description": "Title for the list modal (e.g., \"This Week's Meetings\", \"Upcoming Events\")"
        },
        "pagination": {
          "type": "object",
          "description": "Pagination info from the lookup response. Pass this to show page navigation.",
          "properties": {
            "current_page": {
              "type": "number"
            },
            "last_page": {
              "type": "number"
            },
            "total": {
              "type": "number"
            },
            "has_more_pages": {
              "type": "boolean"
            }
          }
        }
      },
      "required": [
        "event_ids"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_event_view",
    "description": "Close the event view modal. Call when user says \"close\", \"dismiss\", \"okay\", \"got it\" while viewing an event.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_events_list",
    "description": "Close the events list modal. Call when user says \"close\", \"dismiss\" while viewing a list of events.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "create_event",
    "description": "Create a new calendar event. REQUIRES CONFIRMATION. Use when user wants to schedule a meeting, add something to their calendar, or book time.\n\nIMPORTANT WORKFLOW:\n1. If user doesn't specify duration or end time, ASK \"How long should this be?\" (default 1 hour if they say \"standard\" or \"normal\")\n2. ASK about location: \"Where will this meeting take place? Is it online or in-person?\" Options:\n   - Online: Set add_google_meet=true and enable notetaker\n   - In-person: Ask for location/room name\n   - Hybrid: Can do both (location + Google Meet)\n3. For online meetings with notetaker: After creating the event, call enable_notetaker with the meeting_session_id from this response\n4. Always confirm: name, date, start time, duration, and location/online setting before creating\n\n⚠️ SCHEDULING CONFLICTS - DO NOT GUESS:\n- The system automatically checks for conflicts when creating events\n- Do NOT try to calculate conflicts yourself - you may get it wrong\n- Two events ONLY conflict if their time ranges OVERLAP (e.g., 1:00-2:00 PM overlaps with 1:30-2:30 PM)\n- Events that are BACK-TO-BACK do NOT conflict (e.g., 1:00-2:00 PM and 2:00-3:00 PM are fine)\n- Events at DIFFERENT times do NOT conflict (e.g., 1:30 PM does NOT conflict with 3:00 PM)\n- If the system detects a real conflict, it will tell you in the response\n\n⚠️ CRITICAL - ATTENDEE EMAILS:\n- NEVER guess or fabricate emails. NEVER use \"user@example.com\" or similar placeholders\n- ALWAYS call lookup_org_members FIRST to find the person by name\n- Use ONLY the exact email returned from lookup_org_members\n- If person not found: ASK user to spell out the email, then CONFIRM it back before using\n- Wrong emails = strangers invited to private meetings = SERIOUS security issue\n\nRESPONSE: When add_google_meet=true, the response includes meeting_session_id. Use this when calling enable_notetaker.\n\nCommon durations: 30 min, 1 hour (default), 90 min, 2 hours",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Event title/name"
        },
        "date": {
          "type": "string",
          "description": "Date in YYYY-MM-DD format"
        },
        "start_time": {
          "type": "string",
          "description": "Start time in HH:MM format (24-hour). e.g., \"14:30\" for 2:30 PM"
        },
        "end_time": {
          "type": "string",
          "description": "End time in HH:MM format (24-hour). For overnight events (e.g., 10pm to 2am), just provide the times - system auto-detects next day."
        },
        "end_date": {
          "type": "string",
          "description": "End date in YYYY-MM-DD format. ONLY for multi-day events spanning multiple calendar days (conferences, retreats). Do NOT use for simple overnight events."
        },
        "duration_minutes": {
          "type": "number",
          "description": "Alternative to end_time - specify duration in minutes. e.g., 30 for 30 min meeting, 60 for 1 hour. If provided, end_time is calculated automatically."
        },
        "description": {
          "type": "string",
          "description": "Event description or notes"
        },
        "location": {
          "type": "string",
          "description": "Location (e.g., \"Conference Room A\", \"Online\", \"123 Main St\")"
        },
        "priority": {
          "type": "string",
          "enum": [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT"
          ],
          "description": "Event importance/priority. In UI this is shown as \"Importance\"."
        },
        "attendees": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "⚠️ VALIDATED EMAILS ONLY. Must be real emails from lookup_org_members OR lookup_contacts OR explicitly spelled out and confirmed by user. NEVER guess emails."
        },
        "add_google_meet": {
          "type": "boolean",
          "description": "Whether to create and attach a Google Meet link"
        }
      },
      "required": [
        "name",
        "date",
        "start_time"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_event",
    "description": "Update an existing event. REQUIRES CONFIRMATION. Changes sync to Google Calendar if linked.\\n\\n⚠️ CRITICAL - ATTENDEE EMAILS:\\n- NEVER guess or fabricate emails. NEVER use \"user@example.com\" or similar placeholders\\n- ALWAYS call lookup_org_members FIRST to find the person by name\\n- Use ONLY the exact email returned from lookup_org_members\\n- If person not found: ASK user to spell out the email, then CONFIRM it back before using\\n- Wrong emails = strangers invited to private meetings = SERIOUS security issue\\n\\nATTENDEE OPERATIONS:\\n- Use \"add_attendees\" when user says \"add X to the meeting\" - this PRESERVES existing attendees\\n- Use \"attendees\" ONLY when you have the complete list and want to replace everyone\\n\\nTIME HANDLING: When changing start_time, the end_time automatically shifts to maintain the original duration.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event to update"
        },
        "name": {
          "type": "string",
          "description": "New event title (if changing)"
        },
        "date": {
          "type": "string",
          "description": "New date in YYYY-MM-DD format (if rescheduling)"
        },
        "start_time": {
          "type": "string",
          "description": "New start time in HH:MM format (if changing)"
        },
        "end_time": {
          "type": "string",
          "description": "New end time in HH:MM format (if changing). For same-day events, just provide the time. For overnight events (e.g., 10pm to 2am), the system auto-detects next day."
        },
        "end_date": {
          "type": "string",
          "description": "End date in YYYY-MM-DD format. ONLY use this for multi-day events that span more than one calendar day (e.g., conferences, retreats). For overnight events like \"10pm to 2am\", do NOT use this - the system handles it automatically."
        },
        "description": {
          "type": "string",
          "description": "New description (if changing)"
        },
        "location": {
          "type": "string",
          "description": "New location (if changing)"
        },
        "priority": {
          "type": "string",
          "enum": [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT"
          ],
          "description": "New importance/priority (if changing)"
        },
        "attendees": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "⚠️ VALIDATED EMAILS ONLY. Replaces ALL existing attendees. Must be real emails from lookup_org_members OR lookup_contacts OR explicitly spelled out and confirmed by user."
        },
        "add_attendees": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "⚠️ VALIDATED EMAILS ONLY. ADDs to existing attendees without removing anyone. Must be real emails from lookup_org_members OR lookup_contacts OR explicitly spelled out and confirmed by user."
        },
        "sync_to_google": {
          "type": "boolean",
          "description": "Whether to sync changes to Google Calendar (only if event is linked). Default true if linked."
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_event",
    "description": "Delete an event from the calendar. REQUIRES CONFIRMATION.\n\nIMPORTANT - GOOGLE CALENDAR:\n1. BEFORE calling this function, check if the event has a Google Meet link or was synced from Google Calendar\n2. If it's a Google-linked event, ASK the user: \"Should I also remove this from your Google Calendar, or just from Zunou?\"\n3. Set delete_from_google=true ONLY if user explicitly confirms they want it removed from Google too\n4. If user says \"just delete it\" without specifying, default to delete_from_google=false to be safe\n5. Always confirm what will happen: \"I'll delete [event name] from Zunou\" or \"I'll delete [event name] from both Zunou and Google Calendar\"",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event to delete"
        },
        "delete_from_google": {
          "type": "boolean",
          "description": "Set to true ONLY if user explicitly confirms they want the event removed from Google Calendar as well. Default to false if not specified."
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_calendar_availability",
    "description": "Find free time slots on a given day or date range. Returns available slots with context about surrounding meetings.\n\nUse this when user asks:\n- \"When am I free today?\"\n- \"Do I have time for a 30-minute call tomorrow?\"\n- \"What's my availability this week?\"\n- \"Find me an hour between 2 and 5pm\"\n\nThe response includes:\n- Free slots with duration\n- Events before and after each slot (for context like \"free at 2pm, but you have Budget Meeting at 1pm and Team Sync at 3:30pm\")\n- Whether slots fall within preferred work hours\n\nFor visual display, use show_availability after getting the data.",
    "parameters": {
      "type": "object",
      "properties": {
        "date": {
          "type": "string",
          "description": "Date to check availability (YYYY-MM-DD). Defaults to today if not specified."
        },
        "date_from": {
          "type": "string",
          "description": "Start of date range (YYYY-MM-DD). Use for multi-day queries."
        },
        "date_to": {
          "type": "string",
          "description": "End of date range (YYYY-MM-DD). Use for multi-day queries."
        },
        "min_duration": {
          "type": "number",
          "description": "Minimum free slot duration in minutes. Default 30. Use 60 for hour slots, 15 for quick calls."
        },
        "preferred_start": {
          "type": "string",
          "description": "Preferred earliest time (HH:MM in 24h format, e.g., \"09:00\"). Default is 08:00."
        },
        "preferred_end": {
          "type": "string",
          "description": "Preferred latest time (HH:MM in 24h format, e.g., \"17:00\"). Default is 18:00."
        },
        "time_preference": {
          "type": "string",
          "enum": [
            "morning",
            "afternoon",
            "evening",
            "any"
          ],
          "description": "Time of day preference. Morning=8am-12pm, Afternoon=12pm-5pm, Evening=5pm-8pm."
        }
      },
      "required": []
    }
  },
  {
    "type": "function",
    "name": "show_availability",
    "description": "Display calendar availability in a beautiful visual timeline modal. Shows the day with hour markers, events as colored blocks, and free slots highlighted.\n\nUse this AFTER lookup_calendar_availability when user wants to SEE their availability visually.\n\nIMPORTANT: Pass the events and free_slots arrays EXACTLY as returned from lookup_calendar_availability. Do NOT modify the datetime strings - do not add \"Z\" suffix or convert timezones. The times are already in the user's local timezone.\n\nFeatures:\n- Hour-by-hour timeline view\n- Events shown as colored blocks (color by importance)\n- Free slots clearly highlighted with duration\n- Suggested meeting times prominently displayed\n- Real-time: modal updates when user says \"show me tomorrow\" or \"what about next Monday\"\n\nUser can:\n- Tap a free slot to select it (for creating an event)\n- Navigate to previous/next day\n- See at a glance where they have time",
    "parameters": {
      "type": "object",
      "properties": {
        "date": {
          "type": "string",
          "description": "Date to display (YYYY-MM-DD)"
        },
        "events": {
          "type": "array",
          "description": "Array of events for this day from lookup_calendar_availability. Pass EXACTLY as returned, do not modify datetime strings.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "start": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "end": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "importance": {
                "type": "string",
                "enum": [
                  "Critical",
                  "High",
                  "Medium",
                  "Low"
                ]
              }
            }
          }
        },
        "free_slots": {
          "type": "array",
          "description": "Array of free slots from lookup_calendar_availability. Pass EXACTLY as returned, do not modify datetime strings.",
          "items": {
            "type": "object",
            "properties": {
              "start": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "end": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "duration": {
                "type": "number",
                "description": "Duration in minutes"
              },
              "before_event": {
                "type": "string",
                "description": "Name of event before this slot"
              },
              "after_event": {
                "type": "string",
                "description": "Name of event after this slot"
              }
            }
          }
        },
        "suggested_slots": {
          "type": "array",
          "description": "AI-recommended best slots (optional)",
          "items": {
            "type": "object",
            "properties": {
              "start": {
                "type": "string"
              },
              "end": {
                "type": "string"
              },
              "duration": {
                "type": "number"
              },
              "reason": {
                "type": "string",
                "description": "Why this slot is recommended"
              }
            }
          }
        },
        "title": {
          "type": "string",
          "description": "Optional title for the modal (e.g., \"Your Availability\" or \"Finding time for Budget Review\")"
        }
      },
      "required": [
        "date",
        "events",
        "free_slots"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_availability_view",
    "description": "Update the availability modal to show a different day. Use when user says things like \"show me tomorrow instead\" or \"what about Monday?\" while the availability modal is open.\n\nIMPORTANT: You must call lookup_calendar_availability for the new date FIRST to get the events and free_slots data. Do NOT pass empty arrays - always fetch fresh data before updating the view.\n\nPass the events and free_slots arrays EXACTLY as returned from lookup_calendar_availability. Do NOT modify the datetime strings.\n\nThis is more efficient than closing and re-opening the modal.",
    "parameters": {
      "type": "object",
      "properties": {
        "date": {
          "type": "string",
          "description": "New date to display (YYYY-MM-DD)"
        },
        "events": {
          "type": "array",
          "description": "Events for the new date. Pass EXACTLY as returned from lookup_calendar_availability.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "start": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "end": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "importance": {
                "type": "string",
                "enum": [
                  "Critical",
                  "High",
                  "Medium",
                  "Low"
                ]
              }
            }
          }
        },
        "free_slots": {
          "type": "array",
          "description": "Free slots for the new date. Pass EXACTLY as returned from lookup_calendar_availability.",
          "items": {
            "type": "object",
            "properties": {
              "start": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "end": {
                "type": "string",
                "description": "Local datetime string (pass exactly as returned)"
              },
              "duration": {
                "type": "number",
                "description": "Duration in minutes"
              },
              "before_event": {
                "type": "string"
              },
              "after_event": {
                "type": "string"
              }
            }
          }
        },
        "suggested_slots": {
          "type": "array",
          "description": "Updated suggested slots (optional)",
          "items": {
            "type": "object",
            "properties": {
              "start": {
                "type": "string"
              },
              "end": {
                "type": "string"
              },
              "duration": {
                "type": "number"
              },
              "reason": {
                "type": "string"
              }
            }
          }
        }
      },
      "required": [
        "date",
        "events",
        "free_slots"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_availability_view",
    "description": "Close the availability modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "lookup_event_agendas",
    "description": "Get the agenda items for an event. Agendas are visible to all meeting attendees. IMPORTANT: You must use lookup_events first to get the event_id (UUID format).",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The UUID of the event (e.g., \"9cb4f090-a10f-46de-add5-2f84ba402d92\"). Get this from lookup_events first."
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_agenda_item",
    "description": "Add an agenda item to a meeting. Agendas help structure meetings and are shared with all attendees. IMPORTANT: You must use lookup_events first to get the event_id (UUID format).",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The UUID of the event to add agenda to (e.g., \"9cb4f090-a10f-46de-add5-2f84ba402d92\"). Get this from lookup_events first."
        },
        "text": {
          "type": "string",
          "description": "The agenda item text"
        }
      },
      "required": [
        "event_id",
        "text"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_agenda_item",
    "description": "Edit an existing agenda item text.",
    "parameters": {
      "type": "object",
      "properties": {
        "agenda_id": {
          "type": "string",
          "description": "The ID of the agenda item to update"
        },
        "text": {
          "type": "string",
          "description": "The new text for the agenda item"
        },
        "current_text": {
          "type": "string",
          "description": "The current text of the agenda item (for confirmation display)"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the event this agenda belongs to (for confirmation display)"
        }
      },
      "required": [
        "agenda_id",
        "text"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_agenda_item",
    "description": "Remove an agenda item from a meeting.",
    "parameters": {
      "type": "object",
      "properties": {
        "agenda_id": {
          "type": "string",
          "description": "The ID of the agenda item to delete"
        },
        "agenda_text": {
          "type": "string",
          "description": "The text of the agenda item being deleted (for confirmation display)"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the event this agenda belongs to (for confirmation display)"
        }
      },
      "required": [
        "agenda_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_talking_points",
    "description": "Get the user's personal talking points for an event. These are PRIVATE - only the event owner can see them. Like a personal checklist for the meeting.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_talking_point",
    "description": "Add a personal talking point/reminder for a meeting. These are private and only visible to you.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        },
        "text": {
          "type": "string",
          "description": "The talking point text"
        }
      },
      "required": [
        "event_id",
        "text"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_talking_point",
    "description": "Edit a talking point or mark it as complete/incomplete.",
    "parameters": {
      "type": "object",
      "properties": {
        "talking_point_id": {
          "type": "string",
          "description": "The ID of the talking point"
        },
        "text": {
          "type": "string",
          "description": "New text (if editing)"
        },
        "complete": {
          "type": "boolean",
          "description": "Mark as complete (true) or incomplete (false)"
        },
        "current_text": {
          "type": "string",
          "description": "The current text of the talking point (for confirmation display)"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the event this talking point belongs to (for confirmation display)"
        }
      },
      "required": [
        "talking_point_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "complete_talking_point",
    "description": "Mark a talking point as done/checked off.",
    "parameters": {
      "type": "object",
      "properties": {
        "talking_point_id": {
          "type": "string",
          "description": "The ID of the talking point to complete"
        },
        "talking_point_text": {
          "type": "string",
          "description": "The text of the talking point (for confirmation display)"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the event this talking point belongs to (for confirmation display)"
        }
      },
      "required": [
        "talking_point_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_talking_point",
    "description": "Remove a talking point from a meeting.",
    "parameters": {
      "type": "object",
      "properties": {
        "talking_point_id": {
          "type": "string",
          "description": "The ID of the talking point to delete"
        },
        "talking_point_text": {
          "type": "string",
          "description": "The text of the talking point being deleted (for confirmation display)"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the event this talking point belongs to (for confirmation display)"
        }
      },
      "required": [
        "talking_point_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_meeting_session",
    "description": "Get the meeting session status for an event - whether notetaker is enabled, recording status, etc.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "attach_google_meet",
    "description": "Add a Google Meet link to an event. This creates a meeting session that enables the notetaker bot.\n\nIMPORTANT: This returns a meeting_session_id in the response. If you need to call enable_notetaker immediately after, pass this meeting_session_id to it.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event to add Google Meet to"
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "enable_notetaker",
    "description": "Turn on the notetaker bot for a meeting. The bot will join and record the meeting.\n\nIMPORTANT: If you just called attach_google_meet, you MUST pass the meeting_session_id from that response to this function. Otherwise the notetaker may fail to enable due to timing issues.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        },
        "meeting_session_id": {
          "type": "string",
          "description": "The meeting session ID. REQUIRED if you just called attach_google_meet - use the meeting_session_id from that response."
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "disable_notetaker",
    "description": "Turn off the notetaker bot for a meeting. The bot will NOT join or record.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        },
        "meeting_session_id": {
          "type": "string",
          "description": "The meeting session ID (if known)"
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "stop_meeting_session",
    "description": "Stop an active recording session. REQUIRES CONFIRMATION. This ends the notetaker bot recording immediately.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event"
        },
        "meeting_session_id": {
          "type": "string",
          "description": "The meeting session ID"
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_past_events",
    "description": "Search for past meetings and events. Use when the user asks about past meetings, what meetings happened, or wants to find a specific recorded meeting.\n\nReturns events that have already occurred, with indicators for which ones have recordings available.\n\nThe response includes pagination info. If has_more_pages is true, you can call again with a higher page number to get more events.\n\nCommon use cases:\n- \"What meetings did I have last week?\"\n- \"Find the meeting about budget from last month\"\n- \"Show me my recorded meetings\"\n- \"What was the last meeting with the sales team?\"",
    "parameters": {
      "type": "object",
      "properties": {
        "search_query": {
          "type": "string",
          "description": "Filter events by name/title keyword"
        },
        "date_from": {
          "type": "string",
          "description": "Start date in YYYY-MM-DD format. Default is 30 days ago."
        },
        "date_to": {
          "type": "string",
          "description": "End date in YYYY-MM-DD format. Default is today."
        },
        "has_recording": {
          "type": "boolean",
          "description": "If true, only return events that have meeting recordings/transcripts"
        },
        "limit": {
          "type": "number",
          "description": "Maximum events per page. Default is 20 for date range queries, 10 otherwise."
        },
        "page": {
          "type": "number",
          "description": "Page number for pagination (1-based). Use when has_more_pages was true in previous response."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_meeting_transcript",
    "description": "Get the transcript from a recorded meeting. Use when the user asks what was discussed, said, or covered in a past meeting.\n\nIMPORTANT: Use the ref (e.g., \"event_1\", \"event_2\") from a previous lookup_events, lookup_past_events, or show_past_event call. Refs are preferred as they are simpler and guaranteed to work within this session. Do NOT make up or guess event IDs.\n\nCommon use cases:\n- \"What did we discuss in the Q4 planning meeting?\"\n- \"Did anyone mention the budget in yesterday's meeting?\"\n- \"Show me the transcript from the meeting with John\"",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the event from a previous lookup. Prefer using the ref. NEVER guess or fabricate an ID."
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting (used to search if event_id/ref not available)"
        },
        "search_query": {
          "type": "string",
          "description": "Optional: specific topic or keyword to search for in the transcript"
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_meeting_actionables",
    "description": "Get action items that came out of a meeting. Use when the user asks about follow-ups, action items, or what needs to be done from a meeting.\n\nIMPORTANT RULES:\n1. Use the ref (e.g., \"event_1\", \"event_2\") from a previous lookup_events, lookup_past_events, or show_past_event call. NEVER make up or guess event IDs.\n2. After calling this function, you MUST tell the user the actual results using the \"speak_to_user\" field from the response.\n3. If actionables are found, tell the user how many and list them (or summarize if many).\n4. If no actionables are found, tell the user explicitly that none were found.\n5. NEVER fabricate or guess event IDs when talking to the user - only use the event_id and event_name from the response.\n\nCommon use cases:\n- \"What are the action items from the standup?\"\n- \"Show me the follow-ups from the Q4 planning meeting\"\n- \"What needs to be done from yesterday's sync?\"",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the event from a previous lookup. Prefer using the ref. NEVER guess or fabricate an ID."
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting (used to search if event_id/ref not available)"
        },
        "status": {
          "type": "string",
          "enum": [
            "PENDING",
            "COMPLETED",
            "ALL"
          ],
          "description": "Filter actionables by completion status. Default shows all."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_meeting_summary",
    "description": "Get the AI-generated summary and highlights from a recorded meeting. Returns the TL;DR, overview paragraphs, attendees, and keywords/tags.\n\n⚠️ WARNING: The \"has_transcript\", \"has_actionables\", \"has_takeaways\" flags in this response may be INACCURATE.\n- To get actual ACTION ITEMS, always call lookup_meeting_actionables\n- To get actual TAKEAWAYS, always call lookup_meeting_takeaways  \n- To get actual TRANSCRIPT, always call lookup_meeting_transcript\n- Do NOT assume data doesn't exist based on has_* flags - always query specifically when user asks\n\nIMPORTANT: Use the ref (e.g., \"event_1\", \"event_2\") from a previous lookup_events, lookup_past_events, or show_past_event call. Refs are preferred as they are simpler and guaranteed to work within this session. Do NOT make up or guess event IDs.\n\nThis is the \"Highlights\" tab data from past events. For strategies/takeaways, use lookup_meeting_takeaways. For sentiment and analytics, use lookup_meeting_analytics.\n\nCommon use cases:\n- \"Give me the summary of the Q4 planning meeting\"\n- \"What were the key points from yesterday's standup?\"\n- \"Summarize the meeting with the client\"",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the event from a previous lookup. Prefer using the ref. NEVER guess or fabricate an ID."
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting (used to search if event_id/ref not available)"
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_meeting_takeaways",
    "description": "Get the strategies, takeaways, and key learnings from a recorded meeting. These are actionable insights extracted from the meeting.\n\nIMPORTANT: Use the ref (e.g., \"event_1\", \"event_2\") from a previous lookup_events, lookup_past_events, or show_past_event call. Refs are preferred as they are simpler and guaranteed to work within this session. Do NOT make up or guess event IDs.\n\nThis is the \"Take Aways\" tab data from past events. Different from actionables (which are specific follow-up tasks).\n\nCommon use cases:\n- \"What were the takeaways from the strategy meeting?\"\n- \"What did we learn from the retrospective?\"\n- \"What strategies came out of the planning session?\"",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the event from a previous lookup. Prefer using the ref. NEVER guess or fabricate an ID."
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting (used to search if event_id/ref not available)"
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_meeting_analytics",
    "description": "Get meeting analytics including sentiment analysis, talk time per speaker, and AI-extracted insights.\n\n⚠️ WARNING: This returns LIMITED analytics data only. The \"has_transcript\" and \"has_actionables\" flags in this response may be INACCURATE.\n- To get actual ACTION ITEMS, always call lookup_meeting_actionables\n- To get actual TAKEAWAYS, always call lookup_meeting_takeaways  \n- To get actual TRANSCRIPT, always call lookup_meeting_transcript\n- Do NOT rely on has_* flags to determine if data exists\n\nIMPORTANT: Use the ref (e.g., \"event_1\", \"event_2\") from a previous lookup_events, lookup_past_events, or show_past_event call. Refs are preferred as they are simpler and guaranteed to work within this session. Do NOT make up or guess event IDs.\n\nReturns:\n- sentiment: Overall meeting tone (Positive, Neutral, Negative)\n- talk_times: How much each participant spoke\n- insights: AI observations about the meeting dynamics\n\nCommon use cases:\n- \"How did the meeting go overall?\"\n- \"Who talked the most in the meeting?\"\n- \"What was the sentiment of the client call?\"",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the event from a previous lookup. Prefer using the ref. NEVER guess or fabricate an ID."
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting (used to search if event_id/ref not available)"
        }
      }
    }
  },
  {
    "type": "function",
    "name": "show_past_event",
    "description": "Display a past event with its recording data in a visual modal and get a summary. The response includes counts of available data (actionables, takeaways, transcript lines).\n\nIMPORTANT WORKFLOW:\n1. This function shows the event and returns COUNTS of actionables/takeaways/transcript\n2. If user asks about ACTION ITEMS or FOLLOW-UPS, you MUST call lookup_meeting_actionables to get the actual items\n3. If user asks about TAKEAWAYS or STRATEGIES, you MUST call lookup_meeting_takeaways\n4. If user asks about the TRANSCRIPT or what was said, you MUST call lookup_meeting_transcript\n5. Do NOT tell the user there are no action items just because you haven't called lookup_meeting_actionables yet\n\nThe \"actionable_count\" in the response tells you HOW MANY exist. To GET them, call lookup_meeting_actionables.\n\nIMPORTANT: Use the ref (e.g., \"event_1\", \"event_2\") or exact event_id from a previous lookup_past_events call. Refs are preferred. Do NOT make up or guess IDs.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ref (e.g., \"event_1\") or exact ID of the past event from lookup_past_events. Prefer using the ref."
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_past_events",
    "description": "Display multiple past events in a list modal. Use when user wants to see several past meetings or browse their meeting history visually.\n\nPAGINATION: If there are more events than displayed, pass pagination info AND date_range from the lookup_past_events response. The modal will show \"Page X of Y\" and allow user to navigate through all pages.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_ids": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of past event refs or IDs to display (e.g., [\"event_1\", \"event_2\"])"
        },
        "title": {
          "type": "string",
          "description": "Title for the list modal (e.g., \"Last Week's Meetings\", \"Recorded Meetings\")"
        },
        "pagination": {
          "type": "object",
          "description": "Pagination info from lookup_past_events response. Pass this to show page navigation.",
          "properties": {
            "current_page": {
              "type": "number"
            },
            "last_page": {
              "type": "number"
            },
            "total": {
              "type": "number"
            },
            "has_more_pages": {
              "type": "boolean"
            }
          }
        },
        "date_range": {
          "type": "object",
          "description": "Date range from lookup_past_events response. Required for pagination to fetch more events.",
          "properties": {
            "from": {
              "type": "string",
              "description": "Start date in YYYY-MM-DD format"
            },
            "to": {
              "type": "string",
              "description": "End date in YYYY-MM-DD format"
            }
          }
        }
      },
      "required": [
        "event_ids"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_past_event_view",
    "description": "Close the past event view modal. Call when user says \"close\", \"dismiss\", \"okay\", \"got it\" while viewing a past meeting.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_past_events_list",
    "description": "Close the past events list modal. Call when user says \"close\", \"dismiss\" while viewing a list of past events.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "lookup_insights",
    "description": "Get insights - items that need the user's attention, pending decisions, or recommended actions from Zunou.\n\nIMPORTANT: When user asks for \"all insights\" or \"list all\" or \"show me everything\", use status=\"ALL\". The default NEEDS_ATTENTION only returns unaddressed items.",
    "parameters": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "ALL",
            "NEEDS_ATTENTION",
            "PENDING",
            "ADDRESSED"
          ],
          "description": "Filter by status. Use ALL to get all insights regardless of status. Default is NEEDS_ATTENTION (only unaddressed items)."
        },
        "limit": {
          "type": "number",
          "description": "Maximum insights to return. Default is 5, use higher for \"show all\"."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "close_insight",
    "description": "Mark an insight as COMPLETED/ACTIONED in the system (permanently resolves it).\n\nUSE THIS when user says:\n- \"I've done that\" / \"I handled it\" / \"That's done\"\n- \"I found the location\" / \"I completed that task\" / \"I already did that\"\n- \"Mark that as complete\" / \"Close that insight\" / \"I've actioned that\"\n- Any indication they've resolved the underlying issue\n\nThis is NOT for closing modals - this marks the insight as resolved in the database.\nFor dismissing UI modals, use close_insight_view or close_insights_list instead.",
    "parameters": {
      "type": "object",
      "properties": {
        "insight_id": {
          "type": "string",
          "description": "The ref (e.g., \"insight_1\") or ID of the insight to mark as complete"
        },
        "reason": {
          "type": "string",
          "enum": [
            "ACTIONED",
            "DISMISSED",
            "NOT_RELEVANT",
            "DELEGATED"
          ],
          "description": "Why the insight is being closed: ACTIONED (completed), DISMISSED (not needed), NOT_RELEVANT (doesn't apply), DELEGATED (assigned to someone else)"
        }
      },
      "required": [
        "insight_id",
        "reason"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_insight_recommendations",
    "description": "Get AI-generated recommendations for a specific insight. Returns actionable suggestions like creating tasks, notes, or meetings based on the insight.",
    "parameters": {
      "type": "object",
      "properties": {
        "insight_id": {
          "type": "string",
          "description": "The ID or ref of the insight to get recommendations for (e.g., \"insight_1\" or full ID)"
        }
      },
      "required": [
        "insight_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_insight",
    "description": "Display a single insight in a modal with its details and recommendations.\n\nIMPORTANT: You must call lookup_insights FIRST to get real insight IDs and refs. Then use the ref (e.g., \"insight_1\") or actual ID from the lookup response. DO NOT make up insight IDs.",
    "parameters": {
      "type": "object",
      "properties": {
        "insight_id": {
          "type": "string",
          "description": "The ref (e.g., \"insight_1\") or ID from lookup_insights response. NEVER fabricate IDs."
        },
        "include_recommendations": {
          "type": "boolean",
          "description": "Whether to also fetch and display AI recommendations. Default is true."
        }
      },
      "required": [
        "insight_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_insights",
    "description": "Display a list of insights in a modal.\n\nCRITICAL: You MUST call lookup_insights FIRST and pass the EXACT insights array from its response. DO NOT fabricate or make up insight data - use the real objects returned by lookup_insights including their actual IDs and refs.",
    "parameters": {
      "type": "object",
      "properties": {
        "insights": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Insight ID from lookup_insights"
              },
              "ref": {
                "type": "string",
                "description": "Short ref from lookup_insights (e.g., insight_1)"
              },
              "type": {
                "type": "string",
                "description": "Insight type (DECISION, RISK, OPPORTUNITY, ACTION, INFO)"
              },
              "topic": {
                "type": "string",
                "description": "Insight topic/title"
              },
              "description": {
                "type": "string",
                "description": "Insight description"
              },
              "status": {
                "type": "string",
                "description": "Delivery status"
              },
              "created_at": {
                "type": "string",
                "description": "Creation timestamp"
              }
            }
          },
          "description": "MUST be the exact insights array from lookup_insights response. Do not fabricate."
        },
        "title": {
          "type": "string",
          "description": "Optional title for the modal (e.g., \"Insights Needing Attention\")"
        }
      },
      "required": [
        "insights"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_insight_view",
    "description": "Close the insight detail MODAL (UI only). This does NOT mark the insight as complete - it only dismisses the popup. Use when user wants to dismiss the modal without taking action on the insight itself.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_insights_list",
    "description": "Close the insights list MODAL (UI only). This does NOT mark any insights as complete - it only dismisses the popup. Use when user wants to dismiss the list view without taking action on specific insights.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "review_recommendation",
    "description": "Show a review modal for an insight recommendation. The user can review the proposed task/note/meeting, edit the title and description, then confirm or cancel.\n\nUSE THIS when user wants to:\n- Review a recommendation before executing\n- Edit/modify a recommendation\n- See what will be created\n- Confirm the action with human-in-the-loop\n\nThe modal shows editable fields for:\n- Title\n- Description/details\n- Priority (for tasks)\n\nUser can then:\n- Confirm to create the item with their edits\n- Cancel to go back without creating anything\n\nWORKFLOW:\n1. Call lookup_insight_recommendations to get recommendations\n2. Call this with the insight_id and recommendation to review\n3. Wait for user to confirm or cancel via the modal\n4. Returns success with the edited data if confirmed, or cancelled=true if cancelled",
    "parameters": {
      "type": "object",
      "properties": {
        "insight_id": {
          "type": "string",
          "description": "The ID or ref of the insight (e.g., \"insight_1\" or full ID)"
        },
        "recommendation": {
          "type": "object",
          "description": "The recommendation object from lookup_insight_recommendations",
          "properties": {
            "id": {
              "type": "string",
              "description": "Recommendation ID"
            },
            "title": {
              "type": "string",
              "description": "Recommendation title"
            },
            "summary": {
              "type": "string",
              "description": "Recommendation summary/description"
            },
            "action_type": {
              "type": "string",
              "description": "Type: task, note, or meeting"
            }
          },
          "required": [
            "id",
            "title",
            "action_type"
          ]
        }
      },
      "required": [
        "insight_id",
        "recommendation"
      ]
    }
  },
  {
    "type": "function",
    "name": "execute_insight_recommendation",
    "description": "Execute an AI recommendation for an insight WITHOUT review. This directly creates the suggested item (task, note, or meeting).\n\n⚠️ PREFER review_recommendation instead - it gives the user a chance to review and edit before creating.\n\nOnly use execute_insight_recommendation when:\n- User explicitly says \"just do it\" or \"execute without review\"\n- User has already reviewed via review_recommendation and just wants to create it\n\nFor the human-in-the-loop pattern, use review_recommendation first.",
    "parameters": {
      "type": "object",
      "properties": {
        "insight_id": {
          "type": "string",
          "description": "The ID or ref of the insight (e.g., \"insight_1\" or full ID)"
        },
        "recommendation_id": {
          "type": "string",
          "description": "The ID of the recommendation to execute (from lookup_insight_recommendations)"
        }
      },
      "required": [
        "insight_id",
        "recommendation_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_actionables",
    "description": "Get pending action items from recorded meetings across all meetings.",
    "parameters": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "PENDING",
            "COMPLETED",
            "ALL"
          ],
          "description": "Filter by completion status. Default is PENDING."
        },
        "days_back": {
          "type": "number",
          "description": "Look back this many days for actionables. Default is 14."
        },
        "limit": {
          "type": "number",
          "description": "Maximum actionables to return. Default is 10."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "complete_actionable",
    "description": "Mark a meeting action item as completed.",
    "parameters": {
      "type": "object",
      "properties": {
        "actionable_id": {
          "type": "string",
          "description": "The ID of the actionable to complete"
        }
      },
      "required": [
        "actionable_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "send_actionable_to_task",
    "description": "🎯 USE THIS when user wants to create a task from a MEETING ACTIONABLE. This is the ONLY way to properly link a task to a meeting action item.\n\nCRITICAL WORKFLOW:\n1. FIRST call lookup_meeting_actionables to get the list of actionables with their refs\n2. Find the specific actionable the user wants (e.g., \"actionable_1\", \"actionable_5\")\n3. Call this tool with the EXACT ref from the lookup (e.g., \"actionable_1\")\n\n⚠️ IMPORTANT:\n- Use the EXACT \"ref\" value from lookup_meeting_actionables (e.g., \"actionable_1\")\n- Do NOT make up or guess actionable IDs\n- Do NOT paraphrase the actionable description - use the exact ref\n- If user says \"the first one\", use \"actionable_1\"\n- If user says \"the third one\", use \"actionable_3\"\n\nWHEN TO USE THIS (instead of create_task):\n- User says \"create a task from that actionable\"\n- User says \"send that action item to my tasks\"\n- User references a meeting and wants to track an action item",
    "parameters": {
      "type": "object",
      "properties": {
        "actionable_id": {
          "type": "string",
          "description": "The ref of the actionable from lookup_meeting_actionables (e.g., \"actionable_1\", \"actionable_2\"). Use the EXACT ref value, not a made-up ID."
        },
        "pulse_id": {
          "type": "string",
          "description": "The pulse/team to create the task in. If not provided, uses the current pulse."
        },
        "task_list_id": {
          "type": "string",
          "description": "The ID of the task list to add the task to. If not provided, uses the first available list."
        },
        "new_list_name": {
          "type": "string",
          "description": "If provided, creates a new task list with this name instead of using an existing one"
        }
      },
      "required": [
        "actionable_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "send_all_actionables_to_tasks",
    "description": "Convert all unsent action items from a meeting into tasks. This is a batch operation that creates tasks for all actionables that haven't been converted yet.\n\nIMPORTANT: You must have the event_id from a previous lookup_past_events call.\n\nBy default, tasks are created in the current pulse's default task list. You can specify a different pulse_id to send to a different team's task list.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the event/meeting to get actionables from"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting (for confirmation display)"
        },
        "pulse_id": {
          "type": "string",
          "description": "The pulse/team to create the tasks in. If not provided, uses the current pulse."
        },
        "pulse_name": {
          "type": "string",
          "description": "The name of the pulse (for confirmation display)"
        },
        "task_list_id": {
          "type": "string",
          "description": "The ID of the task list to add the tasks to. If not provided, uses the first available list."
        },
        "task_list_name": {
          "type": "string",
          "description": "The name of the task list (for confirmation display)"
        },
        "new_list_name": {
          "type": "string",
          "description": "If provided, creates a new task list with this name instead of using an existing one"
        }
      },
      "required": [
        "event_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_actionable",
    "description": "Create a manual action item linked to a past meeting. Use this when:\n- User wants to add an action item that wasn't captured by the meeting analysis\n- User remembers something from a meeting that needs to be tracked\n- User wants to manually note a follow-up from a specific meeting\n\nIMPORTANT:\n- You must have the event_id from a previous lookup_past_events call\n- The actionable will be linked to that specific meeting\n- Status defaults to 'PENDING'\n\nAfter creating, the user can later use send_actionable_to_task to convert it to a proper task.",
    "parameters": {
      "type": "object",
      "properties": {
        "event_id": {
          "type": "string",
          "description": "The ID of the past event/meeting to link this actionable to. Use the ref from lookup_past_events (e.g., \"event_1\")."
        },
        "description": {
          "type": "string",
          "description": "The action item description - what needs to be done"
        }
      },
      "required": [
        "event_id",
        "description"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_actionable",
    "description": "Update an existing action item's description or status.\n\nIMPORTANT:\n- You must have the actionable_id from a previous lookup_meeting_actionables call\n- Use the ref from the lookup (e.g., \"actionable_1\", \"actionable_2\")\n\nStatus values:\n- \"PENDING\" - Not yet completed (default)\n- \"COMPLETED\" - Done\n- \"DISMISSED\" - No longer relevant",
    "parameters": {
      "type": "object",
      "properties": {
        "actionable_id": {
          "type": "string",
          "description": "The ref of the actionable from lookup_meeting_actionables (e.g., \"actionable_1\")"
        },
        "description": {
          "type": "string",
          "description": "New description for the action item (optional)"
        },
        "status": {
          "type": "string",
          "enum": [
            "PENDING",
            "COMPLETED",
            "DISMISSED"
          ],
          "description": "New status for the action item (optional)"
        }
      },
      "required": [
        "actionable_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_actionable",
    "description": "Permanently delete an action item. This is a destructive action that cannot be undone.\n\nIMPORTANT:\n- You must have the actionable_id from a previous lookup_meeting_actionables call\n- Use the ref from the lookup (e.g., \"actionable_1\", \"actionable_2\")\n- A confirmation modal will be shown before deletion\n\nConsider using update_actionable with status \"DISMISSED\" instead if the user just wants to hide it.",
    "parameters": {
      "type": "object",
      "properties": {
        "actionable_id": {
          "type": "string",
          "description": "The ref of the actionable from lookup_meeting_actionables (e.g., \"actionable_1\")"
        },
        "actionable_description": {
          "type": "string",
          "description": "The description of the actionable (for confirmation display)"
        },
        "event_name": {
          "type": "string",
          "description": "The name of the meeting this actionable is from (for confirmation display)"
        }
      },
      "required": [
        "actionable_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_org_members",
    "description": "Search for people across the ENTIRE ORGANIZATION (all staff/employees). Use this when:\n- Looking for anyone in the company regardless of team\n- Need to find someone by name when unsure which team they are on\n- Want to find contact info for someone in the organization\n- Looking up how to spell someone's name correctly\n\nSMART MATCHING: This function uses fuzzy and phonetic matching, so it will find:\n- Partial names (e.g., \"Jon\" finds \"Jonathan\")\n- Nicknames (e.g., \"Mike\" finds \"Michael\")\n- Phonetically similar names (e.g., \"Sesh\" finds \"Seth\", \"Satch\")\n- Minor typos or transcription errors\n\nIf no exact match is found, it returns the closest matches. Always present these options to the user to confirm which person they meant.\n\n⚠️ TIP: When looking for someone to add to a meeting or message, ALSO check lookup_contacts in case they are an external person (client, vendor, partner). Search both in parallel!\n\nNote: Returns people from all teams/departments, not just the current team.",
    "parameters": {
      "type": "object",
      "properties": {
        "search_name": {
          "type": "string",
          "description": "Name or partial name to search for. Can be first name, last name, nickname, or partial spelling. The system will fuzzy-match."
        },
        "limit": {
          "type": "number",
          "description": "Maximum results to return. Default 10."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_pulse_members",
    "description": "Get members of a pulse/channel. Use this when:\n- User asks \"who is on my team\" or \"my team members\" (omit pulse_id for current pulse)\n- User asks about members of a specific channel or DM (provide pulse_id)\n- Need to assign a task (IMPORTANT: tasks can ONLY be assigned to pulse members)\n- Want to verify members after creating a DM\n\nCRITICAL: When assigning tasks, you MUST use this to get valid assignee IDs. Tasks cannot be assigned to people outside the current pulse.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The pulse ID to check members for. If omitted, uses the current pulse."
        },
        "limit": {
          "type": "number",
          "description": "Maximum members to return. Default 20."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_pulses",
    "description": "List teams/pulses (including DMs) in the organization. Use this when:\n- User wants to see available teams or channels\n- User asks \"what teams are there\" or \"show me all pulses\"\n- Looking for a pulse by name\n\nFor finding a DM with a specific PERSON, use find_dm_with_person instead (it checks members, not just names).\n\nReturns has_team_thread field - if false, the pulse is corrupted and cannot be used for messaging.",
    "parameters": {
      "type": "object",
      "properties": {
        "search_name": {
          "type": "string",
          "description": "Filter pulses by name (case-insensitive partial match). E.g., \"marketing\" finds \"Marketing Team\"."
        },
        "category": {
          "type": "string",
          "enum": [
            "TEAM",
            "ONETOONE",
            "PERSONAL"
          ],
          "description": "Filter by pulse category. TEAM = team channels, ONETOONE = DMs, PERSONAL = personal pulse."
        },
        "limit": {
          "type": "number",
          "description": "Maximum pulses to return. Default 50."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "lookup_contacts",
    "description": "Search the user's personal contacts (external people outside the organization). Use this when:\n- User mentions someone by name who might be an external contact\n- Looking for a client, vendor, partner, or external collaborator\n- Need to find an email or phone for someone not in the org\n- Adding external attendees to meetings\n- User says \"find contact\", \"look up contact\", \"who is...\"\n\nSMART MATCHING: Uses fuzzy matching so partial names and nicknames work.\n\nIMPORTANT: For internal colleagues (people in the org), use lookup_org_members instead.\nContacts are PERSONAL to the user - clients, vendors, friends, external collaborators.\n\nReturns contacts with short refs (e.g., contact_1) for easier reference in follow-up commands.",
    "parameters": {
      "type": "object",
      "properties": {
        "search": {
          "type": "string",
          "description": "Search term - matches name, email, company, or notes. Leave empty to get all contacts."
        },
        "favorites_only": {
          "type": "boolean",
          "description": "Only return favorite/starred contacts. Default false."
        },
        "limit": {
          "type": "number",
          "description": "Max contacts to return. Default 10."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "get_contact_details",
    "description": "Get full details for a specific contact by ID or short reference. Use this when you need complete info about a contact you already found.",
    "parameters": {
      "type": "object",
      "properties": {
        "contact_id": {
          "type": "string",
          "description": "Contact ID (UUID) or short reference (e.g., \"contact_1\")"
        }
      },
      "required": [
        "contact_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_contact",
    "description": "Create a new contact in the user's personal address book. Use when user wants to save someone's contact info.\n\nREQUIRED fields: name\nOPTIONAL: email, telephone_number, details, alt_email, alt_telephone_number, company, is_favorite\n\nOnly the name is required. Capture whatever info the user provides - they can always add more later.\nAfter creating, tell the user the contact was saved and offer to show it.",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Contact's full name (required)"
        },
        "email": {
          "type": "string",
          "description": "Primary email address (optional)"
        },
        "telephone_number": {
          "type": "string",
          "description": "Primary phone number (optional)"
        },
        "details": {
          "type": "string",
          "description": "Notes about this contact (optional) - context like how they know them, what they work on, etc."
        },
        "alt_email": {
          "type": "string",
          "description": "Alternative email (optional)"
        },
        "alt_telephone_number": {
          "type": "string",
          "description": "Alternative phone (optional)"
        },
        "company": {
          "type": "string",
          "description": "Company/organization name (optional)"
        },
        "is_favorite": {
          "type": "boolean",
          "description": "Mark as favorite (optional)"
        }
      },
      "required": [
        "name"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_contact",
    "description": "Update an existing contact's information. Requires confirmation. Only include fields that are being changed.",
    "parameters": {
      "type": "object",
      "properties": {
        "contact_id": {
          "type": "string",
          "description": "Contact ID or short reference (e.g., \"contact_1\")"
        },
        "name": {
          "type": "string",
          "description": "New name"
        },
        "email": {
          "type": "string",
          "description": "New primary email"
        },
        "telephone_number": {
          "type": "string",
          "description": "New primary phone"
        },
        "alt_email": {
          "type": "string",
          "description": "New alt email"
        },
        "alt_telephone_number": {
          "type": "string",
          "description": "New alt phone"
        },
        "company": {
          "type": "string",
          "description": "New company name"
        },
        "details": {
          "type": "string",
          "description": "New notes"
        },
        "is_favorite": {
          "type": "boolean",
          "description": "Set favorite status"
        }
      },
      "required": [
        "contact_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_contact",
    "description": "Delete a contact from the address book. Requires confirmation. This is permanent.",
    "parameters": {
      "type": "object",
      "properties": {
        "contact_id": {
          "type": "string",
          "description": "Contact ID or short reference"
        },
        "contact_name": {
          "type": "string",
          "description": "Contact name (for confirmation display)"
        }
      },
      "required": [
        "contact_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_contact",
    "description": "Display a contact's details in a visual modal. Use when user wants to see a contact.",
    "parameters": {
      "type": "object",
      "properties": {
        "contact_id": {
          "type": "string",
          "description": "Contact ID or short reference"
        }
      },
      "required": [
        "contact_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_contacts",
    "description": "Display a list of contacts in a visual modal. Use after lookup_contacts when user wants to see results.",
    "parameters": {
      "type": "object",
      "properties": {
        "contacts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Contact ID"
              },
              "ref": {
                "type": "string",
                "description": "Short reference like contact_1"
              },
              "name": {
                "type": "string",
                "description": "Contact name"
              },
              "email": {
                "type": "string",
                "description": "Primary email"
              },
              "telephone_number": {
                "type": "string",
                "description": "Phone"
              },
              "company": {
                "type": "string",
                "description": "Company name"
              },
              "is_favorite": {
                "type": "boolean",
                "description": "Is favorited"
              }
            }
          },
          "description": "Array of contacts to display"
        },
        "title": {
          "type": "string",
          "description": "Modal title (e.g., \"Your Contacts\", \"Search Results\")"
        }
      },
      "required": [
        "contacts"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_contact_view",
    "description": "Close the contact detail view modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_contacts_list",
    "description": "Close the contacts list modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "confirm_pending_action",
    "description": "Confirm a pending action when a confirmation modal is showing. Call this when the user says \"yes\", \"confirm\", \"go ahead\", \"do it\", \"looks good\", \"that's right\", etc.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "cancel_pending_action",
    "description": "Cancel a pending action when a confirmation modal is showing. Call this when the user says \"no\", \"cancel\", \"stop\", \"wait\", \"never mind\", \"don't do that\", etc.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "modify_pending_action",
    "description": "Request modification to a pending action before confirming. Call this when the user wants to change details like \"make it 4pm instead\", \"add Sarah too\", \"change the priority\", etc.",
    "parameters": {
      "type": "object",
      "properties": {
        "modifications": {
          "type": "string",
          "description": "Description of what the user wants to change"
        }
      },
      "required": [
        "modifications"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_task_view",
    "description": "Close the task view modal that is currently being displayed. Call this when the user says \"close\", \"close it\", \"dismiss\", \"hide it\", \"okay\", \"got it\", \"thanks\" while viewing a task. This allows the conversation to continue without navigating away.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_tasks_list",
    "description": "Close the tasks list modal. Call this when the user says \"close\", \"close the list\", \"dismiss\", \"done looking\" while viewing a list of tasks.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "adjust_speaking_pace",
    "description": "Adjust the speaking pace when user asks you to speak faster or slower. Call this IMMEDIATELY when user says things like:\n- \"speak faster\", \"go faster\", \"speed up\", \"too slow\"\n- \"speak slower\", \"slow down\", \"too fast\"\n- \"normal speed\", \"regular pace\"\n\nThis sends a technical command to actually change the pace, not just adjust your speaking style.\nAfter calling this, briefly acknowledge the change and continue the conversation.",
    "parameters": {
      "type": "object",
      "properties": {
        "pace": {
          "type": "string",
          "enum": [
            "slower",
            "normal",
            "faster",
            "much_faster"
          ],
          "description": "The requested pace: slower (deliberate, patient), normal (default), faster (brisk, concise), much_faster (rapid, minimal pauses)"
        },
        "user_feedback": {
          "type": "string",
          "description": "Optional: What the user said that triggered this (helps with debugging)"
        }
      },
      "required": [
        "pace"
      ]
    }
  },
  {
    "type": "function",
    "name": "adjust_speaking_style",
    "description": "Adjust the communication style when user requests a different personality or tone. Call this when user says things like:\n- \"be more professional\", \"be more casual\", \"be friendlier\"\n- \"give me more details\", \"be more concise\", \"get to the point\"\n- \"be more encouraging\", \"be more direct\", \"be more empathetic\"\n- \"talk normally\", \"default style\"\n\nThis changes how you communicate - your tone, level of detail, and personality.\nAfter calling this, briefly acknowledge the change and continue the conversation in the new style.",
    "parameters": {
      "type": "object",
      "properties": {
        "style": {
          "type": "string",
          "enum": [
            "professional",
            "friendly",
            "concise",
            "detailed",
            "encouraging",
            "direct",
            "empathetic",
            "neutral"
          ],
          "description": "The communication style: professional (business-like), friendly (warm, casual), concise (brief, to-the-point), detailed (thorough explanations), encouraging (supportive, positive), direct (straightforward, no-nonsense), empathetic (emotionally aware), neutral (default balanced)"
        },
        "user_feedback": {
          "type": "string",
          "description": "Optional: What the user said that triggered this (helps with debugging)"
        }
      },
      "required": [
        "style"
      ]
    }
  },
  {
    "type": "function",
    "name": "request_text_input",
    "description": "Request the user to type something precisely instead of speaking. This opens a text input field in the UI.\n\nUSE THIS WHEN:\n- You need an exact email address (voice recognition often mishears emails)\n- You need a name spelled precisely (especially unusual names)\n- You need a URL or web address\n- You need a phone number\n- The user has repeated themselves multiple times and you're still not getting it right\n- Any time precision is critical and voice transcription might fail\n\nAFTER CALLING THIS:\n- A text input box will appear for the user\n- Wait for the response before proceeding\n- The user may type their response OR cancel\n- Acknowledge what they typed and confirm it's correct\n\nEXAMPLE FLOWS:\n1. \"Add Alex to the meeting\" → lookup_org_members finds no match → call request_text_input asking for email\n2. \"Create a task for...\" (unclear) → after 2+ failed attempts → offer text input option\n3. \"The website is example dot com slash...\" → call request_text_input for the URL",
    "parameters": {
      "type": "object",
      "properties": {
        "prompt": {
          "type": "string",
          "description": "What you're asking the user to type. Be specific. E.g., \"Please type the email address\", \"Could you type the person's name?\", \"Please type the URL\""
        },
        "input_type": {
          "type": "string",
          "enum": [
            "text",
            "email",
            "name",
            "url",
            "number",
            "phone"
          ],
          "description": "The type of input expected. This affects the keyboard shown on mobile devices: email shows @ keyboard, number shows numpad, etc."
        },
        "placeholder": {
          "type": "string",
          "description": "Optional placeholder text for the input field. E.g., \"john@example.com\", \"Enter name here\""
        },
        "reason": {
          "type": "string",
          "description": "Brief explanation of why you need typed input. Shown to user. E.g., \"I want to make sure I get this right\", \"Email addresses are tricky to hear correctly\""
        }
      },
      "required": [
        "prompt",
        "input_type"
      ]
    }
  },
  {
    "type": "function",
    "name": "capture_photo",
    "description": "Open the camera to capture a photo for analysis. This enables visual input like scanning business cards, handwritten notes, documents, receipts, or whiteboards.\n\nUSE THIS WHEN:\n- User wants to scan a business card to add a contact\n- User has handwritten notes they want to capture\n- User wants to capture a whiteboard or document\n- User mentions scanning, photographing, or taking a picture of something\n- User says things like \"let me show you\", \"I have a card here\", \"scan this\"\n\nAFTER CALLING THIS:\n- A camera UI will open for the user\n- Wait for the response which contains extracted text/data from the image\n- Based on the scan_type and extracted data, offer to take action:\n  - business_card: Offer to create a contact with extracted info\n  - notes: Offer to create tasks or notes from the content\n  - receipt: Summarize amounts/items found\n  - whiteboard: Summarize or create notes from content\n  - document: Read back or summarize the text\n\nIMPORTANT:\n- The image is analyzed by AI vision - you'll receive extracted text and structured data\n- For business cards, the response includes name, title, company, email, phone if found\n- Always confirm the extracted data with the user before creating anything",
    "parameters": {
      "type": "object",
      "properties": {
        "scan_type": {
          "type": "string",
          "enum": [
            "business_card",
            "notes",
            "document",
            "receipt",
            "whiteboard",
            "general"
          ],
          "description": "The type of content being scanned. This helps optimize the OCR/extraction: business_card extracts contact info, notes extracts text for tasks/notes, receipt extracts items/amounts, whiteboard/document extract general text."
        },
        "instruction": {
          "type": "string",
          "description": "Optional specific instruction for what to look for or extract from the image. E.g., \"Look for action items\", \"Find the total amount\", \"Extract all names and emails\""
        },
        "reason": {
          "type": "string",
          "description": "Brief explanation shown to user about why you need a photo. E.g., \"I'll scan this business card and extract the contact details\", \"Let me capture those notes for you\""
        }
      },
      "required": [
        "scan_type"
      ]
    }
  },
  {
    "type": "function",
    "name": "log_error_for_developers",
    "description": "Log an error, bug, or feature request for developers to review. Call this when something goes wrong or user reports an issue.\n\n⚠️ IMPORTANT - CHOOSE THE RIGHT SCOPE:\n- Use report_scope=\"voice_agent\" when the issue is ABOUT the voice agent itself (e.g., \"you didn't understand me\", \"the function call failed\", \"audio issues\")\n- Use report_scope=\"general\" when the issue is about THE APP in general (e.g., \"the calendar page is broken\", \"I can't see my tasks\", \"the meeting didn't record properly\")\n\nFor voice_agent scope, the system automatically captures function call history and transcript.\nFor general scope, focus on capturing the user's description of the bug clearly.\n\nBe DETAILED in error_message - include specific error messages, unexpected values, timing issues, etc.",
    "parameters": {
      "type": "object",
      "properties": {
        "report_scope": {
          "type": "string",
          "enum": [
            "voice_agent",
            "general"
          ],
          "description": "REQUIRED: \"voice_agent\" for issues WITH the voice agent itself, \"general\" for issues with the app/system that user is reporting through voice"
        },
        "error_message": {
          "type": "string",
          "description": "Detailed description of what went wrong. For general issues, capture what the user described as clearly as possible."
        },
        "error_type": {
          "type": "string",
          "enum": [
            "function_call_failed",
            "unexpected_response",
            "audio_issue",
            "connection_issue",
            "user_reported",
            "feature_request",
            "other"
          ],
          "description": "Type of report: user_reported for bugs user noticed in the app, function_call_failed for voice agent API errors"
        },
        "category": {
          "type": "string",
          "enum": [
            "voice-agent",
            "events",
            "tasks",
            "notes",
            "calendar",
            "agendas",
            "talking-points",
            "notetaker",
            "google-meet",
            "chat",
            "home",
            "schedule",
            "scheduling",
            "insights",
            "ui-ux",
            "performance",
            "recording",
            "transcript",
            "notifications",
            "login",
            "sync",
            "other"
          ],
          "description": "Which feature area this relates to - helps developers find and prioritize issues"
        },
        "priority": {
          "type": "string",
          "enum": [
            "low",
            "medium",
            "high",
            "critical"
          ],
          "description": "How urgent is this? Critical = blocking user completely, High = major feature broken, Medium = workaround exists, Low = nice to fix"
        },
        "failed_operation": {
          "type": "string",
          "description": "What specific operation or feature failed? e.g., \"scheduling a meeting\", \"viewing past recordings\", \"loading the home page\""
        },
        "observed_behavior": {
          "type": "string",
          "description": "What actually happened? Describe what the user experienced."
        },
        "expected_behavior": {
          "type": "string",
          "description": "What should have happened? What was the user expecting?"
        },
        "steps_to_reproduce": {
          "type": "string",
          "description": "For general bugs: steps to reproduce the issue if the user described them"
        },
        "user_goal": {
          "type": "string",
          "description": "What was the user ultimately trying to accomplish?"
        },
        "hypothesis": {
          "type": "string",
          "description": "Your hypothesis about what might be causing this, if you have one"
        },
        "additional_context": {
          "type": "string",
          "description": "Any other relevant context the user mentioned"
        }
      },
      "required": [
        "report_scope",
        "error_message",
        "error_type",
        "category"
      ]
    }
  },
  {
    "type": "function",
    "name": "test_error_logging",
    "description": "Test the error logging system by deliberately creating a test error log. Call this when the user says \"test error logging\", \"test the error system\", \"try logging an error\", or similar phrases to verify error logging works.",
    "parameters": {
      "type": "object",
      "properties": {
        "test_message": {
          "type": "string",
          "description": "Optional custom test message. If not provided, uses a default test message."
        }
      }
    }
  },
  {
    "type": "function",
    "name": "report_audio_quality_issue",
    "description": "Report persistent audio quality issues that are preventing meaningful conversation.\n\nWHEN TO USE:\n- User's speech has been garbled/incomprehensible for 2-3 CONSECUTIVE turns\n- You're receiving what appears to be background noise instead of speech\n- You've asked for clarification multiple times but STILL can't understand\n- Transcriptions appear to be random noise rather than coherent words\n\nWHEN NOT TO USE:\n- One unclear word (just ask them to repeat)\n- Brief noise between otherwise clear speech\n- User is speaking clearly but about unexpected/off-topic subjects\n- Normal \"ums\", \"ahs\", or thinking pauses\n- You understood SOME of what they said (just clarify the unclear parts)\n\nThis will:\n1. Mute the microphone\n2. Show the user a modal with options to adjust mic sensitivity\n3. Let them switch to text mode or return to voice with new settings\n\nOnly use this as a last resort after genuinely failing to understand 2-3 turns.",
    "parameters": {
      "type": "object",
      "properties": {
        "issue_type": {
          "type": "string",
          "enum": [
            "garbled_speech",
            "background_noise",
            "no_clear_speech"
          ],
          "description": "Type of audio issue: garbled_speech (words but unintelligible), background_noise (noise overwhelming speech), no_clear_speech (silence or only noise)"
        },
        "description": {
          "type": "string",
          "description": "Brief description of what you experienced (e.g., \"Last 3 responses were unintelligible\", \"Only hearing background chatter\")"
        },
        "turns_affected": {
          "type": "number",
          "description": "Number of consecutive conversation turns affected (should be 2-5)"
        }
      },
      "required": [
        "issue_type",
        "turns_affected"
      ]
    }
  },
  {
    "type": "function",
    "name": "show_content",
    "description": "Display formatted content in a modal. This is a FALLBACK tool - use ONLY when NO dedicated display tool exists for the content type.\n\n⚠️ PREFER SPECIFIC TOOLS FIRST:\n- For events → use show_event or show_events\n- For tasks → use show_task or show_tasks  \n- For notes → use show_note or show_notes\n- For past events → use show_past_event or show_past_events\n\nUSE THIS TOOL WHEN:\n- Displaying custom-generated content (summaries, explanations, comparisons)\n- Showing formatted lists or tables that don't fit existing tools\n- Presenting analysis results or recommendations\n- Any rich content that needs visual display but has no dedicated modal\n\nRICH FORMATTING SUPPORT:\nBasic Markdown:\n- Headings: # H1, ## H2, ### H3\n- Bold: **text**, Italic: *text*, Strikethrough: ~~text~~\n- Lists: - item or 1. item\n- Checkboxes: - [ ] unchecked, - [x] checked\n- Code: `inline` or ```block```\n- Links: [text](url)\n- Blockquotes: > quote\n\nColors & Styling:\n- Colored text: {red}important{/red}, {green}success{/green}, {blue}info{/blue}\n  Available: red, green, blue, yellow, orange, purple, pink, cyan, gray\n- Highlighted text: {highlight:yellow}highlighted{/highlight}\n- Badges/Pills: [[badge text]] or [badge:green]status[/badge]\n\nVisual Elements:\n- Progress bars: [progress:75] or [progress:75:green]\n- Icons: :icon:ph:star-fill: (use Phosphor icons)\n- Callout blocks:\n  :::info\n  Information callout\n  :::\n  Types: info, success, warning, error, tip\n\n- Colored blockquotes: > [warning] This is a warning",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Title displayed at the top of the modal (e.g., \"Meeting Summary\", \"Task Analysis\", \"Recommendations\")"
        },
        "content": {
          "type": "string",
          "description": "The content to display. Supports rich markdown formatting with colors, callouts, badges, and progress bars."
        },
        "category": {
          "type": "string",
          "enum": [
            "info",
            "summary",
            "analysis",
            "recommendation",
            "comparison",
            "list",
            "other"
          ],
          "description": "Optional category for styling/icon. Defaults to \"info\"."
        }
      },
      "required": [
        "title",
        "content"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_content_view",
    "description": "Close the content view modal. Call when user says \"close\", \"dismiss\", \"okay\", \"got it\" while viewing content.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "show_list",
    "description": "Display a structured list in a visually appealing modal. This is a FALLBACK tool for generic lists only.\n\n⚠️ DO NOT USE THIS TOOL FOR:\n- Events/meetings → use show_events instead\n- Tasks → use show_tasks instead  \n- Notes → use show_notes instead\n- Actionables → use show_actionables instead\n- People/members → use appropriate lookup tools\n\nUSE THIS TOOL FOR:\n- Custom generated lists (e.g., \"5 ways to improve productivity\")\n- Comparison lists or rankings\n- Step-by-step instructions\n- Feature lists or capabilities\n- Any structured list data without a dedicated display tool\n\nThe tool accepts structured JSON with rich item metadata for visual display.",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Title for the list modal (e.g., \"Top 5 Recommendations\", \"Meeting Preparation Steps\")"
        },
        "items": {
          "type": "array",
          "description": "Array of list items with optional metadata",
          "items": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string",
                "description": "Primary text/title of the item (required)"
              },
              "subtitle": {
                "type": "string",
                "description": "Secondary text or description"
              },
              "icon": {
                "type": "string",
                "description": "Phosphor icon name (e.g., \"star\", \"check-circle\", \"warning\"). Omit \"ph:\" prefix."
              },
              "status": {
                "type": "string",
                "enum": [
                  "success",
                  "warning",
                  "error",
                  "info",
                  "pending",
                  "neutral"
                ],
                "description": "Status indicator affecting item styling"
              },
              "badge": {
                "type": "string",
                "description": "Small badge/tag text (e.g., \"NEW\", \"IMPORTANT\", \"Optional\")"
              },
              "badge_color": {
                "type": "string",
                "enum": [
                  "green",
                  "red",
                  "blue",
                  "yellow",
                  "orange",
                  "purple",
                  "gray"
                ],
                "description": "Color for the badge. Defaults to gray."
              },
              "checked": {
                "type": "boolean",
                "description": "For checklist style - whether item is checked"
              },
              "progress": {
                "type": "number",
                "description": "Progress percentage (0-100) to show a mini progress bar"
              }
            },
            "required": [
              "text"
            ]
          }
        },
        "style": {
          "type": "string",
          "enum": [
            "bullets",
            "numbered",
            "checklist",
            "cards",
            "minimal"
          ],
          "description": "List display style. Defaults to \"cards\"."
        },
        "sections": {
          "type": "array",
          "description": "Optional: group items into sections with headers",
          "items": {
            "type": "object",
            "properties": {
              "header": {
                "type": "string",
                "description": "Section header text"
              },
              "items": {
                "type": "array",
                "description": "Items in this section (same structure as top-level items)",
                "items": {
                  "type": "object",
                  "properties": {
                    "text": {
                      "type": "string",
                      "description": "Primary text/title of the item"
                    },
                    "subtitle": {
                      "type": "string",
                      "description": "Secondary text or description"
                    },
                    "icon": {
                      "type": "string",
                      "description": "Phosphor icon name"
                    },
                    "status": {
                      "type": "string",
                      "enum": [
                        "success",
                        "warning",
                        "error",
                        "info",
                        "pending",
                        "neutral"
                      ]
                    },
                    "badge": {
                      "type": "string",
                      "description": "Badge/tag text"
                    },
                    "badge_color": {
                      "type": "string",
                      "enum": [
                        "green",
                        "red",
                        "blue",
                        "yellow",
                        "orange",
                        "purple",
                        "gray"
                      ]
                    },
                    "checked": {
                      "type": "boolean"
                    },
                    "progress": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "text"
                  ]
                }
              }
            }
          }
        },
        "footer": {
          "type": "string",
          "description": "Optional footer text (supports markdown)"
        }
      },
      "required": [
        "title",
        "items"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_list_view",
    "description": "Close the list view modal. Call when user says \"close\", \"dismiss\", \"okay\", \"done\" while viewing a list.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "display_html_message",
    "description": "Display rich HTML content directly in the chat conversation (TEXT AGENT ONLY).\n\nUse this tool to render beautifully formatted messages with colors, highlights, and styling directly in the chat - NOT in a modal.\n\nWHEN TO USE:\n- Daily digest/briefing summaries with highlighted events\n- Formatted overviews with color-coded priorities\n- Any response that benefits from visual formatting inline with conversation\n- When you want the content to appear as part of the chat flow, not in a popup\n\nHTML STYLING CLASSES (Tailwind-based):\n- Event/item highlights: <span class='bg-blue-100 px-2 py-1 rounded text-sm'>Event Name</span>\n- Color variations: bg-blue-100, bg-yellow-100, bg-purple-100, bg-green-100, bg-red-100, bg-orange-100\n- Subtle context: <p class='text-gray-600 text-sm mt-1'>Additional context</p>\n- Bold labels: <p><strong>Label:</strong> content</p>\n- Spacing: <div class='mt-2'> for sections\n- Priority colors: text-red-600 (urgent), text-yellow-600 (warning), text-green-600 (good)\n\nEXAMPLE FORMAT:\n\"<p><strong>Today:</strong> <span class='bg-yellow-100 px-2 py-1 rounded text-sm'>Board meeting at 2 PM</span> needs final presentation ready.</p>\n<p class='text-gray-600 text-sm mt-1'>Key prep: Review financial projections by 1 PM.</p>\n<div class='mt-2'><strong>Tomorrow:</strong> <span class='bg-blue-100 px-2 py-1 rounded text-sm'>Client call</span> - prepare status update.</div>\"\n\nNOTE: This creates a message in the chat that renders as HTML. Keep content concise and visually scannable.",
    "parameters": {
      "type": "object",
      "properties": {
        "html_content": {
          "type": "string",
          "description": "The HTML content to display. Use Tailwind CSS classes for styling (bg-blue-100, text-sm, rounded, etc.)"
        }
      },
      "required": [
        "html_content"
      ]
    }
  },
  {
    "type": "function",
    "name": "send_message",
    "description": "Send a message to a team pulse or DM. Both Teams and DMs are pulses - Teams have category TEAM, DMs have category ONETOONE.\n\nFor @mentions, wrap the person's name in the message naturally - the system will format it. For AI replies in team channels, include \"@pulse\" in the message.\n\nIf topic_id is provided, the message is sent to that specific topic within the pulse. If omitted, message goes to \"General\" (top-level).\n\nTo reply to a specific message (shows as a linked reply), include reply_to_message_id.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse (team channel or DM) to send the message to. Can be a pulse ref like \"pulse_1\" from find_dm_with_person or lookup_pulses, or a full UUID."
        },
        "content": {
          "type": "string",
          "description": "The message content. Plain text - will be formatted automatically."
        },
        "topic_id": {
          "type": "string",
          "description": "Optional: The topic ID to send the message to within the pulse. Omit for General/top-level messages."
        },
        "reply_to_message_id": {
          "type": "string",
          "description": "Optional: The ID of a message to reply to. When provided, this message will appear as a reply linked to the original message. Get the message ID from lookup_messages."
        }
      },
      "required": [
        "pulse_id",
        "content"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_messages",
    "description": "Get recent messages from a pulse (team channel or DM). Returns messages with sender info, timestamps, and content.\n\nIMPORTANT: You must call lookup_pulses first to find the pulse_id. Never guess or fabricate a pulse_id.\n\nUse topic_id to filter messages to a specific topic. Omit topic_id to get messages from all topics (or General).",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID or ref (e.g., \"pulse_1\") from lookup_pulses. Must be a valid ID from a previous lookup."
        },
        "topic_id": {
          "type": "string",
          "description": "Optional: Filter to messages in this specific topic. Omit for all messages or General."
        },
        "limit": {
          "type": "number",
          "description": "Maximum messages to return (default 20, max 50)"
        },
        "page": {
          "type": "number",
          "description": "Page number for pagination (default 1)"
        }
      },
      "required": [
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "search_messages",
    "description": "Search for messages in a pulse by keyword. Searches message content and returns matching messages.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to search in"
        },
        "query": {
          "type": "string",
          "description": "The search query/keyword to find in messages"
        },
        "limit": {
          "type": "number",
          "description": "Maximum results to return (default 10)"
        }
      },
      "required": [
        "pulse_id",
        "query"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_unread_counts",
    "description": "Get unread message counts across all pulses (team channels and DMs). Returns pulses that have unread messages.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "show_messages",
    "description": "Display messages in a chat-bubble visual modal. Use when user wants to SEE messages, review a conversation, or view search results. Much better than reading messages aloud. Supports messages from lookup_messages, search_messages, or lookup_pinned_messages. IMPORTANT: Pass all message fields from lookup result including reactions, is_pinned, has_replies - do not omit any fields.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The pulse ID the messages are from (for navigation)"
        },
        "pulse_name": {
          "type": "string",
          "description": "Name of the pulse/channel to show in header"
        },
        "messages": {
          "type": "array",
          "description": "Array of message objects from lookup_messages or search_messages. Pass all fields from lookup result including reactions and is_pinned.",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "content": {
                "type": "string"
              },
              "sender": {
                "type": "string"
              },
              "sender_id": {
                "type": "string"
              },
              "created_at": {
                "type": "string"
              },
              "reactions": {
                "type": "array",
                "description": "Array of reactions on this message",
                "items": {
                  "type": "object",
                  "properties": {
                    "emoji": {
                      "type": "string"
                    },
                    "count": {
                      "type": "number"
                    }
                  }
                }
              },
              "is_pinned": {
                "type": "boolean"
              },
              "has_replies": {
                "type": "boolean"
              },
              "reply_thread_id": {
                "type": "string"
              }
            }
          }
        },
        "context": {
          "type": "string",
          "description": "Context label: \"Recent messages\", \"Search: keyword\", \"Pinned messages\", \"Topic: name\""
        },
        "topic_id": {
          "type": "string",
          "description": "Optional topic ID if messages are from a specific topic"
        }
      },
      "required": [
        "pulse_id",
        "pulse_name",
        "messages"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_messages_view",
    "description": "Close the messages view modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "show_pulses",
    "description": "Display a list of channels and DMs in a visual modal. Use when user asks to see their channels, teams, or conversations. Shows Teams and DMs in organized sections.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulses": {
          "type": "array",
          "description": "Array of pulse objects from lookup_pulses",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "category": {
                "type": "string",
                "enum": [
                  "TEAM",
                  "ONETOONE"
                ]
              },
              "icon": {
                "type": "string"
              },
              "member_count": {
                "type": "number"
              }
            }
          }
        },
        "title": {
          "type": "string",
          "description": "Optional title, e.g. \"Your Channels\" or \"Team Channels\""
        }
      },
      "required": [
        "pulses"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_pulses_list",
    "description": "Close the pulses list modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "show_pulse",
    "description": "Display details of a single pulse/channel in a modal. Shows name, description, member count, and topics. Use when user asks about a specific channel.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse": {
          "type": "object",
          "description": "Pulse object from get_pulse_details",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "category": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            },
            "member_count": {
              "type": "number"
            }
          }
        },
        "topics": {
          "type": "array",
          "description": "Optional array of topics in this pulse from lookup_topics",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "title": {
                "type": "string"
              }
            }
          }
        },
        "members": {
          "type": "array",
          "description": "Optional array of first few members from lookup_pulse_members",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "role": {
                "type": "string"
              }
            }
          }
        }
      },
      "required": [
        "pulse"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_pulse_view",
    "description": "Close the pulse details modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "show_topics",
    "description": "Display topics list for a pulse in a visual modal. Use when user asks to see topics in a channel.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The pulse ID (for navigation)"
        },
        "pulse_name": {
          "type": "string",
          "description": "Name of the pulse for header display"
        },
        "topics": {
          "type": "array",
          "description": "Array of topic objects from lookup_topics",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "created_by": {
                "type": "string"
              },
              "created_at": {
                "type": "string"
              }
            }
          }
        }
      },
      "required": [
        "pulse_id",
        "pulse_name",
        "topics"
      ]
    }
  },
  {
    "type": "function",
    "name": "close_topics_list",
    "description": "Close the topics list modal.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "get_pulse_details",
    "description": "Get detailed information about a specific pulse including name, description, member count, and settings.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to get details for"
        }
      },
      "required": [
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_team_pulse",
    "description": "Create a new team channel (pulse with category TEAM). IMPORTANT: Before creating, use lookup_pulses to check if a similar channel already exists. Only create if user explicitly wants a NEW channel. Requires user confirmation.",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Name for the team channel (e.g., \"Marketing Team\", \"Project Alpha\")"
        },
        "description": {
          "type": "string",
          "description": "Optional description of the channel's purpose"
        },
        "icon": {
          "type": "string",
          "enum": [
            "generic",
            "hr",
            "finance",
            "ops",
            "account",
            "sales",
            "marketing",
            "engineering",
            "product",
            "design",
            "support",
            "legal"
          ],
          "description": "Optional icon for the channel. Defaults to \"generic\"."
        }
      },
      "required": [
        "name"
      ]
    }
  },
  {
    "type": "function",
    "name": "find_dm_with_person",
    "description": "Find an existing DM conversation with a specific person by checking pulse members. Use this when:\n- User asks to see messages with someone but lookup_pulses shows no DM with that name\n- There are \"One-to-One\" named pulses that might be the DM\n- You need to verify if a DM exists before telling user there is none\n\nThis tool checks the members of all ONETOONE pulses to find one containing the specified user.\n\nIMPORTANT: Call this BEFORE ever suggesting to create a new DM. If this returns no result, tell the user \"You don't have an existing conversation with [name]\" and ask if they want to start one.",
    "parameters": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "string",
          "description": "The user ID to find a DM with. Use lookup_org_members first to get the user ID."
        },
        "user_name": {
          "type": "string",
          "description": "The user's name (for display in results). Optional but recommended."
        }
      },
      "required": [
        "user_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_dm_pulse",
    "description": "Create a NEW DM conversation with a user. CRITICAL: Before calling this, you MUST first call find_dm_with_person to check if a DM already exists. NEVER call this just because lookup_pulses doesn't show the person's name - some DMs are named \"One-to-One\" instead of the person's name.\n\nOnly call this when:\n1. find_dm_with_person returned no existing DM, AND\n2. User explicitly wants to START or CREATE a new conversation\n\nRequires user confirmation.",
    "parameters": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "string",
          "description": "The user ID to start a DM with. Use lookup_org_members to find user IDs."
        }
      },
      "required": [
        "user_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_pulse",
    "description": "Update a pulse's name, description, or icon. Requires ADMIN or OWNER role in the pulse.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to update"
        },
        "name": {
          "type": "string",
          "description": "New name for the pulse"
        },
        "description": {
          "type": "string",
          "description": "New description for the pulse"
        },
        "icon": {
          "type": "string",
          "enum": [
            "generic",
            "hr",
            "finance",
            "ops",
            "account",
            "sales",
            "marketing",
            "engineering",
            "product",
            "design",
            "support",
            "legal"
          ],
          "description": "New icon for the pulse"
        }
      },
      "required": [
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_pulse",
    "description": "Delete a pulse (team channel). Only the OWNER can delete a pulse. This action is irreversible and will delete all messages in the channel.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to delete"
        },
        "pulse_name": {
          "type": "string",
          "description": "The name of the pulse (for confirmation display)"
        }
      },
      "required": [
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "add_pulse_member",
    "description": "Add a member to a pulse. Requires ADMIN or OWNER role. Specify the role for the new member.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to add the member to"
        },
        "user_id": {
          "type": "string",
          "description": "The user ID to add. Use lookup_org_members to find user IDs."
        },
        "role": {
          "type": "string",
          "enum": [
            "ADMIN",
            "STAFF",
            "GUEST"
          ],
          "description": "Role for the new member. ADMIN can manage members, STAFF is regular member, GUEST has limited access. Default is STAFF."
        }
      },
      "required": [
        "pulse_id",
        "user_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "remove_pulse_member",
    "description": "Remove a member from a pulse. Requires ADMIN or OWNER role. Cannot remove other ADMINs or the OWNER.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse"
        },
        "pulse_member_id": {
          "type": "string",
          "description": "The pulse_member ID (not user_id) to remove. Get this from lookup_pulse_members."
        },
        "member_name": {
          "type": "string",
          "description": "The name of the member (for confirmation display)"
        }
      },
      "required": [
        "pulse_id",
        "pulse_member_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_topics",
    "description": "Get topics in a pulse. Topics are sub-channels for organizing messages within a pulse.\n\nIMPORTANT: You must call lookup_pulses first to find the pulse_id. Never guess or fabricate a pulse_id.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID or ref (e.g., \"pulse_1\") from lookup_pulses. Must be a valid ID from a previous lookup."
        }
      },
      "required": [
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "create_topic",
    "description": "Create a new topic (sub-channel) in a pulse for organizing messages.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to create the topic in"
        },
        "name": {
          "type": "string",
          "description": "Name for the topic (e.g., \"Q4 Planning\", \"Bug Reports\", \"Announcements\")"
        }
      },
      "required": [
        "pulse_id",
        "name"
      ]
    }
  },
  {
    "type": "function",
    "name": "update_topic",
    "description": "Rename a topic. Use this when user asks to rename, update, or change the name of a topic.",
    "parameters": {
      "type": "object",
      "properties": {
        "topic_id": {
          "type": "string",
          "description": "The ID of the topic to rename. Get this from lookup_topics."
        },
        "new_name": {
          "type": "string",
          "description": "The new name for the topic"
        }
      },
      "required": [
        "topic_id",
        "new_name"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_topic",
    "description": "Delete a topic from a pulse. Messages in the topic will be moved to General.",
    "parameters": {
      "type": "object",
      "properties": {
        "topic_id": {
          "type": "string",
          "description": "The ID of the topic to delete"
        },
        "topic_name": {
          "type": "string",
          "description": "The name of the topic (for confirmation display)"
        },
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse containing the topic"
        }
      },
      "required": [
        "topic_id",
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "edit_message",
    "description": "Edit your own message content. You can only edit messages you sent.",
    "parameters": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "string",
          "description": "The ID of the message to edit"
        },
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse containing the message"
        },
        "new_content": {
          "type": "string",
          "description": "The new message content"
        }
      },
      "required": [
        "message_id",
        "pulse_id",
        "new_content"
      ]
    }
  },
  {
    "type": "function",
    "name": "delete_message",
    "description": "Delete your own message. You can only delete messages you sent.",
    "parameters": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "string",
          "description": "The ID of the message to delete"
        },
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse containing the message"
        }
      },
      "required": [
        "message_id",
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "pin_message",
    "description": "Pin or unpin a message in a pulse. Pinned messages are highlighted and easily accessible.",
    "parameters": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "string",
          "description": "The ID of the message to pin/unpin"
        },
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse containing the message"
        },
        "pinned": {
          "type": "boolean",
          "description": "True to pin, false to unpin"
        }
      },
      "required": [
        "message_id",
        "pulse_id",
        "pinned"
      ]
    }
  },
  {
    "type": "function",
    "name": "lookup_pinned_messages",
    "description": "Get pinned messages in a pulse.",
    "parameters": {
      "type": "object",
      "properties": {
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse to get pinned messages from"
        }
      },
      "required": [
        "pulse_id"
      ]
    }
  },
  {
    "type": "function",
    "name": "add_reaction",
    "description": "Add an emoji reaction to a message.",
    "parameters": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "string",
          "description": "The ID of the message to react to"
        },
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse containing the message"
        },
        "reaction": {
          "type": "string",
          "description": "The emoji reaction (e.g., \"👍\", \"❤️\", \"🎉\", \"😊\", \"🔥\")"
        }
      },
      "required": [
        "message_id",
        "pulse_id",
        "reaction"
      ]
    }
  },
  {
    "type": "function",
    "name": "remove_reaction",
    "description": "Remove an emoji reaction from a message. Use this when the user wants to undo or remove a reaction they previously added.",
    "parameters": {
      "type": "object",
      "properties": {
        "message_id": {
          "type": "string",
          "description": "The ID of the message to remove the reaction from"
        },
        "pulse_id": {
          "type": "string",
          "description": "The ID of the pulse containing the message"
        },
        "reaction": {
          "type": "string",
          "description": "The emoji reaction to remove (e.g., \"👍\", \"❤️\", \"🎉\", \"😊\", \"🔥\")"
        }
      },
      "required": [
        "message_id",
        "pulse_id",
        "reaction"
      ]
    }
  },
  {
    "type": "function",
    "name": "start_collab",
    "description": "Start a LIVE collaboration call/session with internal team members. This opens the Smart Collab page to initiate real-time communication.\n\nUSE THIS FOR LIVE CALLS with internal team:\n- 'Hop on a call with Sarah'\n- 'Quick sync with the design team'\n- 'Let's jump on a video chat'\n- 'Start a call with marketing'\n- 'I need to sync with John'\n\nKEY CHARACTERISTICS:\n- LIVE real-time communication (video/audio call)\n- Typically INTERNAL team members (org members, pulse members)\n- Often tied to a specific pulse/team channel\n- User wants to START talking to someone NOW\n\nDO NOT USE FOR:\n- Recording conversations (use start_instant_meeting)\n- External meetings with clients/vendors (use start_instant_meeting)\n- Meetings already in progress (use start_instant_meeting)\n- Solo brain dumps (use start_brain_dump)\n\nDISAMBIGUATION:\nIf user says 'meeting' without clear intent, ask: 'Would you like to start a live call with your team, or record a conversation that's happening?'\n\nATTENDEE RESOLUTION:\n- Individual names are resolved via org member lookup\n- 'team'/'whole team' = members of specified pulse\n- Use lookup_pulses first if user mentions a team name\n\nNOTE: This ends the voice session since it navigates away from the modal.",
    "parameters": {
      "type": "object",
      "properties": {
        "attendees": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Array of attendee names, or [\"team\"]/[\"whole team\"] to include all members of the specified pulse"
        },
        "pulse_id": {
          "type": "string",
          "description": "Optional: The ID of a specific pulse/team to get members from when using \"team\" keyword. Use lookup_pulses to find this."
        },
        "pulse_name": {
          "type": "string",
          "description": "Optional: The name of the team (for confirmation message). Used with pulse_id."
        },
        "is_online": {
          "type": "boolean",
          "description": "Whether this is an online (true) or in-person (false) collaboration. Default: true"
        }
      },
      "required": [
        "attendees"
      ]
    }
  },
  {
    "type": "function",
    "name": "delegate_to_text_agent",
    "description": "Delegate a text-heavy task to the Text Agent for better handling. Use this for:\n- Drafting emails, messages, or documents\n- Writing detailed plans or proposals\n- Creating summaries or reports\n- Any task requiring significant text generation or iteration\n\nThe Text Agent has a much larger context window and is better suited for writing tasks. Results are displayed in an editable modal so the user can review and modify.\n\nWORKFLOW FOR NEW DRAFTS:\n1. Gather requirements from user (recipient, tone, key points)\n2. Call this tool with clear instructions\n3. Tell user you're drafting and it will appear on screen\n4. After completion, offer to read it, make changes, or help them send it\n\nWORKFLOW FOR EDITS:\nWhen user asks to modify an existing draft (make it shorter, more formal, add something, etc.):\n1. Include the current draft in 'current_draft' parameter\n2. Put the edit instructions in 'instructions'\n3. The Text Agent will revise based on the current content",
    "parameters": {
      "type": "object",
      "properties": {
        "task_type": {
          "type": "string",
          "enum": ["draft_email", "draft_message", "write_document", "create_plan", "summarize", "other"],
          "description": "The type of text task to perform"
        },
        "instructions": {
          "type": "string",
          "description": "Detailed instructions for what to write or how to edit. For new drafts: include purpose, tone, key points. For edits: describe what changes to make (e.g., 'make it shorter', 'add a greeting', 'make it more formal')."
        },
        "current_draft": {
          "type": "string",
          "description": "REQUIRED FOR EDITS: The current draft content that needs to be revised. Get this from the previous delegate_to_text_agent response or from the draft modal. If empty, a new draft will be created."
        },
        "context": {
          "type": "string",
          "description": "Relevant context: recipient info, meeting details, background information, previous conversation context, etc."
        },
        "recipient": {
          "type": "string",
          "description": "For emails/messages: the recipient's name and/or role"
        },
        "subject": {
          "type": "string",
          "description": "For emails: suggested subject line"
        }
      },
      "required": ["task_type", "instructions"]
    }
  },
  {
    "type": "function",
    "name": "save_draft",
    "description": "Save the current draft to Notes. Use when user says 'save it', 'save the draft', 'save to notes', 'that looks good, save it', etc.\n\nThe draft will be saved with appropriate tags based on type (email-draft, message-draft, etc.) and linked to the voice session.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "close_draft",
    "description": "Close/discard the draft modal without saving. Use when user says 'close it', 'discard', 'never mind', 'cancel', 'don't save', etc.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "minimize_draft",
    "description": "Minimize the draft modal to a small tab on the side of the screen. Use when user says 'minimize it', 'put it aside', 'set it aside', 'hide for now', 'I need to check something'. The draft remains accessible and can be restored later.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "restore_draft",
    "description": "Restore/bring back a minimized draft modal. Use when user says 'bring back the draft', 'show the draft again', 'open the draft', 'where's my draft'. Only works if a draft was previously minimized.",
    "parameters": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "type": "function",
    "name": "start_instant_meeting",
    "description": "Start RECORDING an unscheduled meeting or conversation. This opens the recording UI to capture audio for transcription and AI analysis.\n\nUSE THIS FOR RECORDING conversations:\n- 'Record this meeting'\n- 'I'm in a meeting with a client, capture this'\n- 'Log this conversation with the vendor'\n- 'Record my call with Alex'\n- 'I'm having a chat with someone, record it'\n- 'Capture this discussion'\n\nKEY CHARACTERISTICS:\n- RECORDS audio for later transcription and AI insights\n- Often EXTERNAL people (clients, vendors, partners, contacts)\n- Meeting may already be IN PROGRESS\n- Produces transcript, action items, and insights after recording\n- Speaker diarization identifies different voices\n\nDO NOT USE FOR:\n- Starting a live call with your team (use start_collab)\n- Internal team syncs (use start_collab)\n- Solo recordings without other people (use start_brain_dump)\n\nDISAMBIGUATION:\nIf user says 'meeting' without clear intent, ask: 'Would you like to start a live call with your team, or record a conversation that's happening?'\n\nATTENDEE RESOLUTION:\n- Check lookup_org_members AND lookup_contacts in parallel\n- External people often in contacts, not org members\n- Names without emails are OK - user can add in UI\n- If no attendees mentioned, just open UI\n\nNOTE: This ends the voice/text session since it navigates away from the modal.",
    "parameters": {
      "type": "object",
      "properties": {
        "attendees": {
          "type": "array",
          "description": "People in the meeting. Can be just names - emails are optional. If you couldn't resolve a name via lookup tools, still include them with just the name.",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Person's name"
              },
              "email": {
                "type": "string",
                "description": "Person's email address (optional - can be empty if not resolved)"
              },
              "gravatar": {
                "type": "string",
                "description": "Avatar URL if available"
              },
              "source": {
                "type": "string",
                "enum": ["organization", "contact", "email", "name_only"],
                "description": "Where the person was found: organization (org member), contact (from contacts), email (external email), name_only (just a name, no email)"
              }
            },
            "required": ["name"]
          }
        },
        "title": {
          "type": "string",
          "description": "Optional meeting title/topic, e.g., 'Product roadmap discussion'"
        }
      }
    }
  },
  {
    "type": "function",
    "name": "start_brain_dump",
    "description": "Start a personal brain dump recording session. Use when user wants to speak their thoughts out loud and have Zunou analyze them.\n\nCOMMON TRIGGERS:\n- 'Start a brain dump'\n- 'I want to do a brain dump'\n- 'Let me think out loud'\n- 'Record my thoughts'\n- 'I need to brain dump'\n\nBrain dumps are solo - just the user speaking. No other participants. The recording will be transcribed and analyzed by Zunou to generate insights.\n\nNOTE: This ends the voice/text session since it navigates away from the modal.",
    "parameters": {
      "type": "object",
      "properties": {
        "mode": {
          "type": "string",
          "enum": ["on-device", "google-meet"],
          "description": "Recording mode. 'on-device' records directly on the device, 'google-meet' opens a Meet call with Zunou's notetaker bot. Defaults to 'on-device' (recommended)."
        },
        "auto_start": {
          "type": "boolean",
          "description": "If true, automatically start recording in the specified mode without showing mode selection. If false/omitted, show the mode selection step first."
        }
      }
    }
  }
];

export const VOICE_AGENT_TOOL_AGENTS = {
  "end_session": "both",
  "confirm_pending_action": "both",
  "cancel_pending_action": "both",
  "modify_pending_action": "both",
  "adjust_speaking_pace": "voice",
  "adjust_speaking_style": "voice",
  "request_text_input": "voice",
  "capture_photo": "both",
  "create_task": "both",
  "create_task_list": "both",
  "lookup_tasks": "both",
  "lookup_task_lists": "both",
  "get_task_details": "both",
  "show_task": "both",
  "show_tasks": "both",
  "close_task_view": "both",
  "close_tasks_list": "both",
  "complete_task": "both",
  "update_task": "both",
  "delete_task": "both",
  "delete_task_list": "both",
  "create_note": "both",
  "lookup_notes": "both",
  "get_note_details": "both",
  "show_note": "both",
  "show_notes": "both",
  "close_note_view": "both",
  "close_notes_list": "both",
  "pin_note": "both",
  "unpin_note": "both",
  "update_note": "both",
  "delete_note": "both",
  "lookup_events": "both",
  "lookup_event_details": "both",
  "show_event": "both",
  "show_events": "both",
  "close_event_view": "both",
  "close_events_list": "both",
  "create_event": "both",
  "update_event": "both",
  "delete_event": "both",
  "lookup_calendar_availability": "both",
  "show_availability": "both",
  "update_availability_view": "both",
  "close_availability_view": "both",
  "lookup_event_agendas": "both",
  "create_agenda_item": "both",
  "update_agenda_item": "both",
  "delete_agenda_item": "both",
  "lookup_talking_points": "both",
  "create_talking_point": "both",
  "update_talking_point": "both",
  "complete_talking_point": "both",
  "delete_talking_point": "both",
  "lookup_meeting_session": "both",
  "attach_google_meet": "both",
  "enable_notetaker": "both",
  "disable_notetaker": "both",
  "stop_meeting_session": "both",
  "lookup_past_events": "both",
  "lookup_meeting_transcript": "both",
  "lookup_meeting_actionables": "both",
  "lookup_meeting_summary": "both",
  "lookup_meeting_takeaways": "both",
  "lookup_meeting_analytics": "both",
  "show_past_event": "both",
  "show_past_events": "both",
  "close_past_event_view": "both",
  "close_past_events_list": "both",
  "complete_actionable": "both",
  "update_actionable": "both",
  "delete_actionable": "both",
  "send_actionable_to_task": "both",
  "lookup_insights": "both",
  "get_insight_details": "both",
  "show_insight": "both",
  "show_insights": "both",
  "close_insight_view": "both",
  "close_insights_list": "both",
  "dismiss_insight": "both",
  "get_insight_recommendations": "both",
  "execute_recommendation": "both",
  "dismiss_recommendation": "both",
  "lookup_org_members": "both",
  "lookup_pulse_members": "both",
  "lookup_contacts": "both",
  "create_contact": "both",
  "update_contact": "both",
  "delete_contact": "both",
  "show_contact": "both",
  "show_contacts": "both",
  "close_contact_view": "both",
  "close_contacts_list": "both",
  "lookup_pulses": "both",
  "lookup_topics": "both",
  "lookup_messages": "both",
  "send_message": "both",
  "create_pulse": "both",
  "create_topic": "both",
  "show_messages": "both",
  "show_pulses": "both",
  "show_pulse": "both",
  "show_topics": "both",
  "close_messages_view": "both",
  "close_pulses_list": "both",
  "close_pulse_view": "both",
  "close_topics_list": "both",
  "start_collab": "both",
  "delegate_to_text_agent": "both",
  "save_draft": "both",
  "close_draft": "both",
  "minimize_draft": "both",
  "restore_draft": "both",
  "navigate_to_chat": "both",
  "show_content": "both",
  "show_list": "both",
  "close_content_view": "both",
  "close_list_view": "both",
  "display_html_message": "text",
  "log_error_for_developers": "both",
  "report_audio_quality_issue": "voice",
  "start_instant_meeting": "both",
  "start_brain_dump": "both"
};

export const VOICE_AGENT_RISK_LEVELS = {
  "end_session": "low",
  "confirm_pending_action": "low",
  "cancel_pending_action": "low",
  "modify_pending_action": "low",
  "adjust_speaking_pace": "low",
  "adjust_speaking_style": "low",
  "request_text_input": "low",
  "capture_photo": "low",
  "create_task": "low",
  "create_task_list": "low",
  "lookup_tasks": "low",
  "lookup_task_lists": "low",
  "get_task_details": "low",
  "show_task": "low",
  "show_tasks": "low",
  "close_task_view": "low",
  "close_tasks_list": "low",
  "complete_task": "medium",
  "update_task": "high",
  "delete_task": "high",
  "delete_task_list": "high",
  "create_note": "low",
  "lookup_notes": "low",
  "get_note_details": "low",
  "show_note": "low",
  "show_notes": "low",
  "close_note_view": "low",
  "close_notes_list": "low",
  "pin_note": "low",
  "unpin_note": "low",
  "update_note": "medium",
  "delete_note": "high",
  "lookup_events": "low",
  "lookup_event_details": "low",
  "show_event": "low",
  "show_events": "low",
  "close_event_view": "low",
  "close_events_list": "low",
  "create_event": "high",
  "update_event": "high",
  "delete_event": "high",
  "lookup_calendar_availability": "low",
  "show_availability": "low",
  "update_availability_view": "low",
  "close_availability_view": "low",
  "lookup_event_agendas": "low",
  "create_agenda_item": "low",
  "update_agenda_item": "high",
  "delete_agenda_item": "high",
  "lookup_talking_points": "low",
  "create_talking_point": "low",
  "update_talking_point": "high",
  "complete_talking_point": "low",
  "delete_talking_point": "high",
  "lookup_meeting_session": "low",
  "attach_google_meet": "medium",
  "enable_notetaker": "medium",
  "disable_notetaker": "medium",
  "stop_meeting_session": "high",
  "lookup_past_events": "low",
  "lookup_meeting_transcript": "low",
  "lookup_meeting_actionables": "low",
  "lookup_meeting_summary": "low",
  "lookup_meeting_takeaways": "low",
  "lookup_meeting_analytics": "low",
  "show_past_event": "low",
  "show_past_events": "low",
  "close_past_event_view": "low",
  "close_past_events_list": "low",
  "lookup_insights": "low",
  "close_insight": "medium",
  "lookup_insight_recommendations": "low",
  "review_recommendation": "low",
  "execute_insight_recommendation": "medium",
  "show_insight": "low",
  "show_insights": "low",
  "close_insight_view": "low",
  "close_insights_list": "low",
  "lookup_actionables": "low",
  "complete_actionable": "medium",
  "send_actionable_to_task": "medium",
  "send_all_actionables_to_tasks": "medium",
  "create_actionable": "low",
  "update_actionable": "low",
  "delete_actionable": "high",
  "lookup_org_members": "low",
  "lookup_pulse_members": "low",
  "lookup_pulses": "low",
  "lookup_contacts": "low",
  "get_contact_details": "low",
  "create_contact": "low",
  "update_contact": "medium",
  "delete_contact": "high",
  "show_contact": "low",
  "show_contacts": "low",
  "close_contact_view": "low",
  "close_contacts_list": "low",
  "send_message": "high",
  "lookup_messages": "low",
  "search_messages": "low",
  "lookup_unread_counts": "low",
  "show_messages": "low",
  "close_messages_view": "low",
  "show_pulses": "low",
  "close_pulses_list": "low",
  "show_pulse": "low",
  "close_pulse_view": "low",
  "show_topics": "low",
  "close_topics_list": "low",
  "get_pulse_details": "low",
  "find_dm_with_person": "low",
  "create_team_pulse": "high",
  "create_dm_pulse": "high",
  "update_pulse": "medium",
  "delete_pulse": "high",
  "add_pulse_member": "medium",
  "remove_pulse_member": "medium",
  "lookup_topics": "low",
  "create_topic": "low",
  "update_topic": "low",
  "delete_topic": "high",
  "edit_message": "low",
  "delete_message": "medium",
  "pin_message": "low",
  "lookup_pinned_messages": "low",
  "add_reaction": "low",
  "remove_reaction": "low",
  "start_collab": "low",
  "delegate_to_text_agent": "low",
  "save_draft": "low",
  "close_draft": "low",
  "minimize_draft": "low",
  "restore_draft": "low",
  "log_error_for_developers": "low",
  "test_error_logging": "low",
  "report_audio_quality_issue": "low",
  "show_content": "low",
  "close_content_view": "low",
  "show_list": "low",
  "close_list_view": "low",
  "display_html_message": "low",
  "start_instant_meeting": "low",
  "start_brain_dump": "low"
};

// Get tools filtered by agent type
export function getTools(agentType = 'both') {
  return VOICE_AGENT_TOOLS.filter(tool => {
    const toolAgent = VOICE_AGENT_TOOL_AGENTS[tool.name] || 'both';
    return toolAgent === 'both' || toolAgent === agentType;
  });
}

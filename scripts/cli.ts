#!/usr/bin/env node
import { runCommand } from "../lib/commands.ts";

runCommand(process.argv.slice(2));

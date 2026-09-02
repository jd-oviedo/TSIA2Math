// CLI config only. The Node APIs ignore this file, so anything rendered via
// scripts must pass these options directly.
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

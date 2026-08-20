#!/usr/bin/env python3
"""Render a TestNG/Surefire result summary into the GitHub Actions job summary."""

import glob
import os
import xml.etree.ElementTree as ET

BROWSER = os.environ.get("BROWSER", "chrome")
SUMMARY_PATH = os.environ.get("GITHUB_STEP_SUMMARY")


def collect():
    totals = {"tests": 0, "failures": 0, "errors": 0, "skipped": 0, "time": 0.0}
    failed = []
    for path in sorted(glob.glob("target/surefire-reports/TEST-*.xml")):
        root = ET.parse(path).getroot()
        totals["tests"] += int(root.get("tests", 0))
        totals["failures"] += int(root.get("failures", 0))
        totals["errors"] += int(root.get("errors", 0))
        totals["skipped"] += int(root.get("skipped", 0))
        totals["time"] += float(root.get("time", 0) or 0)
        for case in root.iter("testcase"):
            for outcome in ("failure", "error"):
                node = case.find(outcome)
                if node is not None:
                    failed.append(
                        (
                            "{}.{}".format(case.get("classname", "?"), case.get("name", "?")),
                            (node.get("message") or node.get("type") or "").strip().splitlines()[:1],
                        )
                    )
    return totals, failed


def main():
    totals, failed = collect()
    passed = totals["tests"] - totals["failures"] - totals["errors"] - totals["skipped"]
    lines = [
        "## TestNG results ({})".format(BROWSER),
        "",
        "| Total | Passed | Failed | Errors | Skipped | Time (s) |",
        "| ----: | -----: | -----: | -----: | ------: | -------: |",
        "| {tests} | {passed} | {failures} | {errors} | {skipped} | {time:.1f} |".format(
            passed=passed, **totals
        ),
        "",
    ]

    if not totals["tests"]:
        lines.append(
            "No Surefire result files were produced - the suite did not start "
            "(check the run log for browser or network failures)."
        )
    elif failed:
        lines.append("### Failed tests")
        lines.append("")
        for name, message in failed:
            lines.append("- `{}`{}".format(name, ": " + message[0] if message else ""))
        lines.append("")
        lines.append(
            "> The demo suite drives public websites and `FaceBookLoginTest` "
            "asserts false by design, so failures here do not fail the workflow."
        )
    else:
        lines.append("All tests passed.")

    report = "\n".join(lines) + "\n"
    print(report)
    if SUMMARY_PATH:
        with open(SUMMARY_PATH, "a", encoding="utf-8") as handle:
            handle.write(report)


if __name__ == "__main__":
    main()

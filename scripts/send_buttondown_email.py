#!/usr/bin/env python3
"""Send a rich Buttondown email for the latest RSS item."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime
from email.utils import parsedate_to_datetime


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    sys.exit(1)


def format_pub_date(raw_value: str) -> str:
    if not raw_value:
        return ""
    try:
        dt = parsedate_to_datetime(raw_value)
        if dt.tzinfo is not None:
            dt = dt.astimezone()
        return dt.strftime("%Y-%m-%d")
    except Exception:
        try:
            dt = datetime.fromisoformat(raw_value)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            return raw_value


def main() -> None:
    api_key = os.getenv("BUTTONDOWN_API_KEY", "").strip()
    item_json = os.getenv("ITEM_JSON", "").strip()
    if not api_key:
        fail("Missing BUTTONDOWN_API_KEY.")
    if not item_json:
        fail("Missing ITEM_JSON.")

    try:
        item = json.loads(item_json)
    except json.JSONDecodeError as exc:
        fail(f"Invalid ITEM_JSON: {exc}")

    title = str(item.get("title", "")).strip()
    description = str(item.get("description", "")).strip()
    link = str(item.get("link", "")).strip()
    pub_date_raw = str(item.get("pubDate", "")).strip()

    if not title or not link:
        fail("RSS item must include title and link.")

    is_project = title.startswith("[Project]")
    kind = "Project" if is_project else "Writing"
    published = format_pub_date(pub_date_raw)
    subject = f"New {kind}: {title}"

    body_lines = [
        f"Just published a new {kind.lower()}.",
        "",
        f"Title: {title}",
    ]
    if description:
        body_lines.extend(["", f"Summary: {description}"])
    if published:
        body_lines.extend(["", f"Published: {published}"])
    body_lines.extend(["", f"Read now: {link}"])

    payload = {
        "subject": subject,
        "body": "\n".join(body_lines).strip(),
        "status": "about_to_send",
        "email_type": "public",
        "canonical_url": link,
    }

    request = urllib.request.Request(
        "https://api.buttondown.com/v1/emails",
        method="POST",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Token {api_key}",
            "Content-Type": "application/json",
            # Required once per API key for status=about_to_send (programmatic send).
            # See: https://docs.buttondown.com/api-emails-create
            "X-Buttondown-Live-Dangerously": "true",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            response_body = response.read().decode("utf-8")
            parsed = json.loads(response_body) if response_body else {}
            email_id = parsed.get("id", "")
            print(json.dumps({"email_id": email_id, "status": "about_to_send"}))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        fail(f"Buttondown API error ({exc.code}): {details}")
    except urllib.error.URLError as exc:
        fail(f"Network error calling Buttondown API: {exc}")


if __name__ == "__main__":
    main()

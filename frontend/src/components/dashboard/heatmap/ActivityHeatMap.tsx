// @ts-ignore
import CalHeatmap from "cal-heatmap";
// @ts-ignore
import Tooltip from "cal-heatmap/plugins/Tooltip";
// @ts-ignore
import LegendLite from "cal-heatmap/plugins/LegendLite";
import "cal-heatmap/cal-heatmap.css";
import { useHistoryContext } from "@/contexts/history";
import { HistoryService } from "@/helpers/history/history_api_wrappers";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@nextui-org/react";
import { CLIENT_ROUTES } from "@/common/constants";
import { Icons } from "@/components/common/Icons";
import { Tooltip as NextUiTooltip } from "@nextui-org/react";

function getStartAndEndDates(): {
  startDates: Date[];
  endDates: Date[];
} {
  const currentDate = new Date();
  const startDates: Date[] = [];
  const endDates: Date[] = [];

  for (let i = 0; i < 5; i++) {
    let expectedMonth = currentDate.getMonth() - i;
    const expectedYear =
      expectedMonth < 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();

    // convert expected month to actual month value, range from 0 to 11
    expectedMonth = ((expectedMonth % 12) + 12) % 12;

    // Calculate the last day of the month by setting the day to 0
    const lastDayOfMonth = new Date(
      expectedYear,
      expectedMonth + 1,
      0
    ).getDate();

    // Set the day of the current month to 1
    const startDate = new Date(expectedYear, expectedMonth, 1);

    // Set the day of the current month to the last day of the month
    const endDate = new Date(expectedYear, expectedMonth, lastDayOfMonth);

    startDates.push(startDate);
    endDates.push(endDate);
  }

  return { startDates, endDates };
}

const ActivityHeatMap = () => {
  // we wnat to obtain the actual data from history
  const { history } = useHistoryContext();

  const cal = new CalHeatmap();

  const { startDates, endDates } = getStartAndEndDates();

  // ensure heatmap only paint once even though there are multiple rerenders, this is done by using the same cal object
  useMemo(() => {
    if (!history || history.length === 0) {
      cal.paint(
        {
          // data to display the heatmap
          data: {
            source: [],
            x: "date",
            y: "value",
          },
          // start date of the heatmap
          date: {
            start: startDates[4],
            max: endDates[0],
            timezone: "Asia/Singapore",
          },
          // color scheme for the heatmap
          scale: {
            color: {
              type: "quantize",
              scheme: "Blues",
              domain: [0, 10],
            },
          },
          range: 6, //show 6 months of data
          theme: "dark",
          // heatmap domain
          domain: {
            type: "month",
            gutter: 10,
          },
          // cell domain
          subDomain: { type: "day", width: 16, height: 16, radius: 2 },
          itemSelector: "#cal-heatmap",
        },
        [
          [
            Tooltip,
            {
              text: function (
                timestamp: number,
                value: number,
                dayjsDate: any
              ) {
                if (!value) {
                  value = 0;
                }
                // convert timestamp to date
                const date = new Date(timestamp).toLocaleDateString("en-US", {
                  timeZone: "Asia/Singapore",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                if (value <= 1) {
                  return `${value} submission on ${date}`;
                }

                return `${value} submissions on ${date}`;
              },
            },
          ],
          [
            LegendLite,
            {
              itemSelector: "#cal-heatmap-legend",
              width: 12,
              height: 12,
              radius: 2,
            },
          ],
        ]
      );
      return;
    }

    const heatMapValues =
      HistoryService.getNumberOfAttemptedQuestionsByDate(history);

    cal.paint(
      {
        // data to display the heatmap
        data: {
          source: heatMapValues,
          x: "date",
          y: "value",
        },
        // start date of the heatmap
        date: {
          start: startDates[4],
          max: endDates[0],
          timezone: "Asia/Singapore",
        },
        // color scheme for the heatmap
        scale: {
          color: {
            type: "quantize",
            scheme: "Blues",
            domain: [0, 10],
          },
        },
        range: 6, //show 6 months of data
        theme: "dark",
        // heatmap domain
        domain: {
          type: "month",
          gutter: 10,
        },
        // cell domain
        subDomain: { type: "day", width: 16, height: 16, radius: 2 },
        itemSelector: "#cal-heatmap",
      },
      [
        [
          Tooltip,
          {
            text: function (timestamp: number, value: number, dayjsDate: any) {
              if (!value) {
                value = 0;
              }
              // convert timestamp to date
              const date = new Date(timestamp).toLocaleDateString("en-US", {
                timeZone: "Asia/Singapore",
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              if (value <= 1) {
                return `${value} submission on ${date}`;
              }

              return `${value} submissions on ${date}`;
            },
          },
        ],
        [
          LegendLite,
          {
            itemSelector: "#cal-heatmap-legend",
            width: 12,
            height: 12,
            radius: 2,
          },
        ],
      ]
    );
  }, [history]);

  return (
    <div className="flex flex-col h-full w-full gap-2 rounded-lg overflow-auto scrollbar-hide">
      <div className="flex justify-between font-semibold py-4 px-2">
        <p>Submission from past 6 months:</p>
        <NextUiTooltip
          content="View all attempted questions"
          placement="bottom"
        >
          <Link
            href={`${CLIENT_ROUTES.QUESTIONS}/history`}
            className="text-warning"
          >
            <Icons.GoLinkExternal />
          </Link>
        </NextUiTooltip>
      </div>
      <div className="flex justify-center items-center p-4 mx-2 bg-cal-heatmap rounded">
        {/* Heatmap */}
        <div id="cal-heatmap" className="overflow-auto"></div>
      </div>
      {/* Heatmap legend */}
      <div id="cal-heatmap-legend" className="flex justify-end mx-2" />
    </div>
  );
};

export default ActivityHeatMap;

"use client"

import React, { useMemo } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Task, TaskId } from "@/lib/types"
import { TaskItem } from "@/components/task/task-item"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAtomValue, useSetAtom } from "jotai"
import { openQuickAddAtom } from "@tasktrove/atoms/ui/navigation"
import { updateQuickAddTaskAtom } from "@tasktrove/atoms/ui/dialogs"
import { baseFilteredTasksAtom } from "@tasktrove/atoms/data/tasks/filters"
import { viewStatesAtom, getViewStateOrDefault } from "@tasktrove/atoms/ui/views"
import { applyViewStateFilters } from "@tasktrove/atoms/utils/view-filters"
import { sortTasksByViewState } from "@tasktrove/atoms/utils/view-sorting"

type QuadrantKey = 1 | 2 | 3 | 4

interface QuadrantConfig {
  key: QuadrantKey
  title: string
  description: string
  accent: string
  badge: string
  text: string
}

const QUADRANTS: QuadrantConfig[] = [
  {
    key: 1,
    title: "중요하고 급한 일",
    description: "바로 처리해야 할 일",
    accent: "from-rose-500/15 via-rose-500/10 to-rose-500/5",
    badge: "bg-rose-500 text-white",
    text: "text-rose-600",
  },
  {
    key: 2,
    title: "중요하지만 급하지 않은 일",
    description: "계획을 세워 진행하기",
    accent: "from-amber-500/15 via-amber-500/10 to-amber-500/5",
    badge: "bg-amber-500 text-white",
    text: "text-amber-600",
  },
  {
    key: 3,
    title: "중요하지 않지만 급한 일",
    description: "가능하면 위임하기",
    accent: "from-blue-500/15 via-blue-500/10 to-blue-500/5",
    badge: "bg-blue-500 text-white",
    text: "text-blue-600",
  },
  {
    key: 4,
    title: "중요하지도 급하지도 않은 일",
    description: "나중에 검토하거나 버리기",
    accent: "from-emerald-500/15 via-emerald-500/10 to-emerald-500/5",
    badge: "bg-emerald-500 text-white",
    text: "text-emerald-600",
  },
]

export function EisenhowerMatrix() {
  const isMobile = useIsMobile()
  const openQuickAdd = useSetAtom(openQuickAddAtom)
  const updateQuickAddTask = useSetAtom(updateQuickAddTaskAtom)
  const baseTasks = useAtomValue(baseFilteredTasksAtom)
  const viewStates = useAtomValue(viewStatesAtom)

  const viewStateWithCompleted = useMemo(() => {
    const baseViewState = getViewStateOrDefault(viewStates, "eisenhower")
    return { ...baseViewState, showCompleted: true }
  }, [viewStates])

  const tasksForMatrix = useMemo(() => {
    const filtered = applyViewStateFilters(baseTasks, viewStateWithCompleted, "eisenhower")
    return sortTasksByViewState([...filtered], viewStateWithCompleted)
  }, [baseTasks, viewStateWithCompleted])

  const groupedTasks = useMemo(() => {
    const base: Record<QuadrantKey, Task[]> = { 1: [], 2: [], 3: [], 4: [] }
    tasksForMatrix.forEach((task) => {
      const bucket = (task.priority as QuadrantKey) || 4
      base[bucket].push(task)
    })
    return base
  }, [tasksForMatrix])

  const handleAddTaskForPriority = (priority: QuadrantKey) => {
    updateQuickAddTask({ updateRequest: { priority } })
    openQuickAdd()
  }

  const renderQuadrantTasks = (quadrantKey: QuadrantKey) => {
    const quadrantTasks = groupedTasks[quadrantKey]
    const sortedIds: TaskId[] = quadrantTasks.map((task) => task.id)

    if (quadrantTasks.length === 0) {
      return (
        <div className="text-sm text-muted-foreground border border-dashed border-border/50 rounded-lg p-4">
          비어 있어요. 가장 먼저 떠오르는 일을 적어볼까요?
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {quadrantTasks.map((task) => (
          <TaskItem
            key={task.id}
            taskId={task.id}
            variant="kanban"
            showProjectBadge={!isMobile}
            sortedTaskIds={sortedIds}
            className="bg-card/80 w-full transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 px-2 md:px-0">
      <div className="rounded-2xl border bg-muted/40 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">아이젠하워 매트릭스</h1>
            <p className="text-sm text-muted-foreground">
              우선순위를 한눈에 보고 빠르게 처리할 일을 정리하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUADRANTS.map((quad) => (
              <Badge key={quad.key} className={cn("flex items-center gap-1", quad.badge)}>
                P{quad.key}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 lg:gap-4 px-1 sm:px-2 lg:px-4">
        {QUADRANTS.map((quad) => (
          <div
            key={quad.key}
            className={cn(
              "rounded-2xl border bg-card/70 shadow-sm h-full",
              "p-4 sm:p-5",
              "bg-gradient-to-br",
              quad.accent,
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold",
                    quad.badge,
                  )}
                >
                  P{quad.key}
                </div>
                <div>
                  <div className={cn("text-base font-semibold", quad.text)}>{quad.title}</div>
                  <div className="text-xs text-muted-foreground">{quad.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {groupedTasks[quad.key].length} 개
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleAddTaskForPriority(quad.key)}
                  aria-label={`P${quad.key} 작업 추가`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {renderQuadrantTasks(quad.key)}
          </div>
        ))}
      </div>
    </div>
  )
}

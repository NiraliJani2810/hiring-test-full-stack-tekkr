import { ProjectPlan } from "../lib/projectPlan";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ProjectPlanPreview({ plan }: { plan: ProjectPlan }) {
  return (
    <div className="my-3 rounded-lg border bg-background">
      <div className="px-4 py-3 font-semibold">Project Workstreams</div>

      <Accordion type="multiple" className="w-full">
        {plan.workstreams.map((ws, idx) => (
          <AccordionItem key={ws.id} value={ws.id} className="px-2">
            <AccordionTrigger className="px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                  {String.fromCharCode(65 + (idx % 26))}
                </div>
                <div className="text-left">
                  <div className="font-medium">{ws.title}</div>
                  {ws.description ? (
                    <div className="text-sm text-muted-foreground mt-1">
                      {ws.description}
                    </div>
                  ) : null}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-12 pb-4">
              <div className="mt-2 font-semibold">Deliverables</div>
              <div className="mt-2 space-y-3">
                {ws.deliverables.map((d, i) => (
                  <div key={i}>
                    <div className="font-medium">{d.title}</div>
                    {d.description ? (
                      <div className="text-sm text-muted-foreground">{d.description}</div>
                    ) : null}
                  </div>
                ))}
                {ws.deliverables.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No deliverables listed.</div>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

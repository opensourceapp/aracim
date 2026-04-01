import { useState, useRef } from "react";
import { checklistData } from "@/data/checklistData";
import { useChecklist } from "@/hooks/useChecklist";
import { useFilters } from "@/hooks/useFilters";
import { useVehicleInfo } from "@/hooks/useVehicleInfo";
import { ChecklistHeader } from "@/components/ChecklistHeader";
import { FilterBar } from "@/components/FilterBar";
import { SectionCard } from "@/components/SectionCard";
import { FloatingBar } from "@/components/FloatingBar";
import { VehicleInfo } from "@/components/VehicleInfo";
import { ConfettiEffect } from "@/components/ConfettiEffect";

const Index = () => {
  const checklist = useChecklist();
  const filters = useFilters(checklist.items);
  const vehicle = useVehicleInfo();
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompleteRef = useRef(checklist.isComplete);

  const handleToggle = (key: string) => {
    checklist.toggle(key);
  };

  // Check for completion after each render cycle
  if (checklist.isComplete && !prevCompleteRef.current && !showConfetti) {
    prevCompleteRef.current = true;
    setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 0);
  }
  if (!checklist.isComplete) {
    prevCompleteRef.current = false;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] pb-28">
      {showConfetti && <ConfettiEffect />}

      <ChecklistHeader
        percentage={checklist.percentage}
        checkedCount={checklist.checkedCount}
        issueCount={checklist.issueCount}
        totalItems={checklist.totalItems}
        isComplete={checklist.isComplete}
        hasVehicleInfo={vehicle.hasInfo}
        onVehicleInfoClick={() => setShowVehicleInfo(!showVehicleInfo)}
      />

      {showVehicleInfo && (
        <VehicleInfo
          info={vehicle.info}
          onUpdate={vehicle.update}
          onClose={() => setShowVehicleInfo(false)}
        />
      )}

      <FilterBar
        search={filters.search}
        onSearchChange={filters.setSearch}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={filters.setStatusFilter}
        tagFilter={filters.tagFilter}
        onTagFilterChange={filters.setTagFilter}
        categoryFilters={filters.categoryFilters}
        onCategoryToggle={filters.toggleCategoryFilter}
        onClearFilters={filters.clearFilters}
        hasActiveFilters={filters.hasActiveFilters}
        statusCounts={filters.statusCounts}
      />

      {/* Success Banner */}
      {checklist.isComplete && (
        <div className="mx-4 mb-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-emerald-300">Tüm kontroller tamamlandı!</p>
            <p className="text-sm text-emerald-300/70">Araç teslime hazır.</p>
          </div>
        </div>
      )}

      {/* Section Cards */}
      <div className="px-4 space-y-3">
        {checklistData.map((section, sectionIndex) => {
          if (!filters.isSectionVisible(sectionIndex)) return null;
          const filteredItems = filters.getFilteredItems(sectionIndex);
          if (filteredItems.length === 0) return null;

          return (
            <SectionCard
              key={sectionIndex}
              title={section.title}
              sectionIndex={sectionIndex}
              items={filteredItems}
              itemStates={checklist.items}
              progress={checklist.getSectionProgress(sectionIndex)}
              onToggle={handleToggle}
              onMarkIssue={checklist.markIssue}
              onUpdateNote={checklist.updateNote}
              onAddPhoto={checklist.addPhoto}
              onRemovePhoto={checklist.removePhoto}
            />
          );
        })}
      </div>

      <FloatingBar
        percentage={checklist.percentage}
        onReset={checklist.reset}
      />
    </div>
  );
};

export default Index;

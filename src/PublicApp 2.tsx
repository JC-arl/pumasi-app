import { useState, useMemo } from "react";
import SearchBar from "./components/SearchBar";
import RentalOfficeList from "./components/RentalOfficeList";
import RentalOfficeModal from "./components/RentalOfficeModal";
import Map from "./components/Map";
import { mockRentalOffices } from "./data/mockData";
import type { RentalOffice } from "./types/rental";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

export default function PublicApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<RentalOffice | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 검색 필터링
  const filteredOffices = useMemo(() => {
    if (!searchQuery.trim()) return mockRentalOffices;

    return mockRentalOffices.filter(
      (office) =>
        office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.availableMachinery.some((machinery) =>
          machinery.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery]);

  const handleOfficeSelect = (office: RentalOffice) => {
    setSelectedOffice(office);
  };

  const handleMarkerClick = (office: RentalOffice) => {
    setSelectedOffice(office);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                농기계 임대 사무소 찾기
              </h1>
              <p className="mt-2 text-gray-600">
                전국 농기계 임대 사무소를 지도에서 확인하고 정보를 조회하세요
              </p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="h-4 w-4 mr-2" />
              관리자
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사이드바 - 임대소 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 max-h-[600px] overflow-y-auto">
              <RentalOfficeList
                offices={filteredOffices}
                onOfficeSelect={handleOfficeSelect}
                selectedOffice={selectedOffice}
              />
            </div>
          </div>

          {/* 지도 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <Map
                rentalOffices={filteredOffices}
                onMarkerClick={handleMarkerClick}
                selectedOffice={selectedOffice}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 모달 */}
      <RentalOfficeModal
        office={selectedOffice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
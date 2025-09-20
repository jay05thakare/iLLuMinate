import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacility } from '../contexts/FacilityContext';
import { useNotification } from '../contexts/NotificationContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { BuildingOfficeIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import FacilityModal from '../components/modals/FacilityModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import ErrorAlert, { NetworkErrorAlert, DataNotFoundAlert } from '../components/ui/ErrorAlert';

const Facilities = () => {
  const { facilities, loading, createFacility, updateFacility, error, fetchFacilities } = useFacility();
  const { showSuccess, showError } = useNotification();
  const { handleError, clearError } = useErrorHandler();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle opening modal for adding new facility
  const handleAddFacility = () => {
    setSelectedFacility(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Handle opening modal for editing facility
  const handleEditFacility = (facility, e) => {
    e.preventDefault(); // Prevent navigation to facility detail
    e.stopPropagation();
    setSelectedFacility(facility);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFacility(null);
  };

  // Handle saving facility (both add and edit)
  const handleSaveFacility = async (facilityData) => {
    setIsSubmitting(true);
    clearError(); // Clear any previous errors
    
    try {
      let result;
      
      if (modalMode === 'add') {
        result = await createFacility(facilityData);
      } else {
        result = await updateFacility(selectedFacility.id, facilityData);
      }
      
      if (result.success) {
        showSuccess(
          `Facility ${modalMode === 'add' ? 'created' : 'updated'} successfully`,
          { title: modalMode === 'add' ? 'Facility Created' : 'Facility Updated' }
        );
        handleModalClose();
      } else {
        handleError(new Error(result.error || `Failed to ${modalMode} facility`));
      }
    } catch (error) {
      handleError(error, { 
        context: `${modalMode === 'add' ? 'Creating' : 'Updating'} facility`,
        facilityData 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <button
            onClick={handleAddFacility}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Facility
          </button>
        </div>
        
        <ErrorAlert
          type="error"
          title="Failed to Load Facilities"
          message={error}
          onRetry={() => fetchFacilities()}
          onClose={clearError}
        />
      </div>
    );
  }

  // No data state
  if (!facilities || facilities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <button
            onClick={handleAddFacility}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Facility
          </button>
        </div>
        
        <DataNotFoundAlert
          resource="facilities"
          onRetry={() => fetchFacilities()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-600">Manage your cement production facilities</p>
        </div>
        <button onClick={handleAddFacility} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Facility
        </button>
      </div>

      {/* Facilities Grid */}
      {facilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="card hover:shadow-lg transition-shadow relative">
              <div className="p-6">
                {/* Edit Button */}
                <button
                  onClick={(e) => handleEditFacility(facility, e)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit facility"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>

                <Link to={`/facilities/${facility.id}`} className="block">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{facility.name}</h3>
                      <p className="text-sm text-gray-500">{facility.location?.country}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{facility.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="badge-success">{facility.status}</span>
                    <span className="text-primary-600 text-sm hover:text-primary-800">
                      View Details →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first facility</p>
          <button onClick={handleAddFacility} className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Facility
          </button>
        </div>
      )}

      {/* Facility Modal */}
      <FacilityModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveFacility}
        facility={selectedFacility}
        mode={modalMode}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Facilities;

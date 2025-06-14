// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { Camera, Loader2 } from 'lucide-react';
// import { useState } from 'react';
// import { toast } from 'sonner';

// interface Plot {
//   id: string;
//   title: string;
//   location: string;
// }

// interface Land {
//   id: string;
//   number: string;
//   size: string;
//   plot: {
//     title: string;
//     location: string;
//   };
// }

// interface AssignCameraDialogProps {
//   plots: Plot[];
//   lands: Land[];
//   onSuccess: () => void;
//   trigger?: React.ReactNode;
// }

// export default function AssignCameraDialog({
//   plots,
//   lands,
//   onSuccess,
//   trigger
// }: AssignCameraDialogProps) {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedPlot, setSelectedPlot] = useState<string>('');
//   const [selectedLand, setSelectedLand] = useState<string>('');
//   const [ipAddress, setIpAddress] = useState('');
//   const [label, setLabel] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleAssign = async () => {
//     if ((!selectedPlot && !selectedLand) || !ipAddress) {
//       toast.error('Please select a plot/land and enter an IP address');
//       return;
//     }

//     setLoading(true);
//     try {
//       const endpoint = selectedPlot
//         ? '/api/assign-camera'
//         : '/api/assign-land-camera';
//       const id = selectedPlot || selectedLand;
//       const idField = selectedPlot ? 'plotId' : 'landId';

//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           [idField]: id,
//           ipAddress,
//           label: label || null
//         })
//       });

//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || 'Failed to assign camera');
//       }

//       toast.success('Camera assigned successfully!');
//       setIsDialogOpen(false);
//       onSuccess();
//     } catch (error: any) {
//       toast.error(
//         error.message || 'Failed to assign camera. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//       <DialogTrigger asChild>
//         {trigger || (
//           <Button>
//             <Camera className='mr-2 h-4 w-4' />
//             Assign Camera
//           </Button>
//         )}
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Assign New Camera</DialogTitle>
//         </DialogHeader>
//         <div className='space-y-4 py-4'>
//           <div className='space-y-2'>
//             <Label>Type</Label>
//             <Select
//               value={selectedPlot ? 'plot' : 'land'}
//               onValueChange={(value) => {
//                 setSelectedPlot('');
//                 setSelectedLand('');
//                 if (value === 'plot') {
//                   setSelectedPlot(plots[0]?.id || '');
//                 } else {
//                   setSelectedLand(lands[0]?.id || '');
//                 }
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder='Select type' />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value='plot'>Plot</SelectItem>
//                 <SelectItem value='land'>Land</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className='space-y-2'>
//             <Label>Select {selectedPlot ? 'Plot' : 'Land'}</Label>
//             <Select
//               value={selectedPlot || selectedLand}
//               onValueChange={(value) => {
//                 if (selectedPlot) {
//                   setSelectedPlot(value);
//                 } else {
//                   setSelectedLand(value);
//                 }
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue
//                   placeholder={`Select a ${selectedPlot ? 'plot' : 'land'}`}
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {selectedPlot
//                   ? plots.map((plot) => (
//                       <SelectItem key={plot.id} value={plot.id}>
//                         {plot.title} - {plot.location}
//                       </SelectItem>
//                     ))
//                   : lands.map((land) => (
//                       <SelectItem key={land.id} value={land.id}>
//                         {land.number} - {land.plot.title} ({land.size})
//                       </SelectItem>
//                     ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className='space-y-2'>
//             <Label>IP Address</Label>
//             <Input
//               placeholder='e.g., http://192.168.1.100:8080/video'
//               value={ipAddress}
//               onChange={(e) => setIpAddress(e.target.value)}
//             />
//           </div>

//           <div className='space-y-2'>
//             <Label>Label (Optional)</Label>
//             <Input
//               placeholder='e.g., Front Gate Camera'
//               value={label}
//               onChange={(e) => setLabel(e.target.value)}
//             />
//           </div>

//           <Button
//             onClick={handleAssign}
//             disabled={loading || (!selectedPlot && !selectedLand) || !ipAddress}
//             className='w-full'
//           >
//             {loading ? (
//               <>
//                 <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                 Assigning...
//               </>
//             ) : (
//               <>
//                 <Camera className='mr-2 h-4 w-4' />
//                 Assign Camera
//               </>
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

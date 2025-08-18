'use client';

import { getSupabase } from '@/lib/supabaseClient';

export interface TransportRoute {
  id: string;
  name: string;
  busNumber?: string | null;
  driverName?: string | null;
  capacity?: number | null;
}

export interface StudentLite {
  studentId: string;
  name: string;
  classSection?: string | null;
}

export interface RouteAssignment {
  routeId: string;
  studentId: string;
}

export async function listRoutes(): Promise<TransportRoute[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('transport_routes')
    .select('id, name, bus_number, driver_name, capacity')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    name: r.name,
    busNumber: r.bus_number,
    driverName: r.driver_name,
    capacity: r.capacity,
  }));
}

export async function createRoute(input: Omit<TransportRoute, 'id'>): Promise<TransportRoute> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const payload = {
    name: input.name,
    bus_number: input.busNumber ?? null,
    driver_name: input.driverName ?? null,
    capacity: input.capacity ?? null,
  };
  const { data, error } = await supabase
    .from('transport_routes')
    .insert(payload)
    .select('id, name, bus_number, driver_name, capacity')
    .single();
  if (error) throw error;
  return {
    id: String(data!.id),
    name: data!.name,
    busNumber: data!.bus_number,
    driverName: data!.driver_name,
    capacity: data!.capacity,
  };
}

export async function deleteRoute(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('transport_routes').delete().eq('id', id);
  if (error) throw error;
}

export async function listStudentsLite(): Promise<StudentLite[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('students')
    .select('student_id, name, class_section')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    studentId: s.student_id,
    name: s.name,
    classSection: s.class_section,
  }));
}

export async function getAssignmentsForRoute(routeId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('route_assignments')
    .select('student_id')
    .eq('route_id', routeId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.student_id as string);
}

export async function setAssignmentsForRoute(routeId: string, studentIds: string[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');
  // Transactional approach is not directly supported in Supabase client; do in two steps
  const del = await supabase.from('route_assignments').delete().eq('route_id', routeId);
  if (del.error) throw del.error;
  if (studentIds.length === 0) return;
  const payload = studentIds.map((sid) => ({ route_id: routeId, student_id: sid }));
  const { error } = await supabase.from('route_assignments').insert(payload);
  if (error) throw error;
}
